import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

const PORT = parseInt(process.env.PORT) || 8080;

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Verify user endpoint from auth0 and register to db
app.post("/verify-user", requireAuth, async (req, res) => {
  // auth0 jwt
  const auth0Id = req.auth.payload.sub;
  // email and name come from custom claims "onExecutePostLogin" we added in api
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const picture = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/picture`];

  console.log(req.auth);
  console.log("auth0Id:", auth0Id);
  console.log("name:", name);
  console.log("email:", email);
  console.log("picture:", picture);

  // defensive coding
  if (!name || !email || !picture) {
    return res
      .status(400)
      .json({ error: "Missing email, name, or picture in JWT" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });

    if (user) {
      res.json(user);
    } else {
      const newUser = await prisma.user.create({
        data: {
          email,
          auth0Id,
          name,
          picture,
        },
      });
      res.json(newUser);
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/************* POST *************/

// helper function to find user by auth0id
const findUserByAuth0Id = async (auth0Id) => {
  const user = await prisma.user.findUnique({
    where: { auth0Id },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

// Optional middleware to conditionally apply requireAuth
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) {
    requireAuth(req, res, next);
  } else {
    next();
  }
};

// get posts - allows anonymous access but limited to 5 posts
// using the optional requireAuth middleware
app.get("/posts", optionalAuth, async (req, res) => {
  try {
    let userId = null;
    if (req.auth) {
      const auth0Id = req.auth.payload.sub;
      console.log("Auth0Id from token:", auth0Id);

      try {
        const user = await findUserByAuth0Id(auth0Id);
        userId = user.id;
      } catch (error) {
        console.error("User not found:", error);
      }
    }

    console.log("UserId from token:", userId);

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        likes: true, // Include likes to determine if user liked the post
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      take: userId ? undefined : 5,
    });

    // remap for simplicity to use at frontend
    const postsWithCounts = posts.map((post) => {
      const isLikedByUser = userId
        ? post.likes.some((like) => like.userId === userId)
        : false;
      console.log(`Post ID: ${post.id}, isLikedByUser: ${isLikedByUser}`);
      return {
        ...post,
        commentsCount: post._count.comments,
        likesCount: post._count.likes,
        isLikedByUser,
      };
    });

    res.json(postsWithCounts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "An error occurred while fetching posts" });
  }
});

// get specific post by id - needs authentication
app.get("/posts/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    let userId = null;
    if (req.auth) {
      const auth0Id = req.auth.payload.sub;
      console.log("Auth0Id from token:", auth0Id);

      try {
        const user = await findUserByAuth0Id(auth0Id);
        userId = user.id;
      } catch (error) {
        console.error("User not found:", error);
      }
    }

    console.log("UserId from token:", userId);

    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        author: true,
        likes: true, // Include likes to determine if user liked the post
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLikedByUser = userId
      ? post.likes.some((like) => like.userId === userId)
      : false;
    console.log(`Post ID: ${post.id}, isLikedByUser: ${isLikedByUser}`);

    const postWithCounts = {
      ...post,
      commentsCount: post._count.comments,
      likesCount: post._count.likes,
      isLikedByUser,
    };

    res.json(postWithCounts);
  } catch (error) {
    console.error("Error fetching post:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the post" });
  }
});

// create a new posts - need authentication
app.post("/posts", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { content } = req.body;

  if (!content) {
    return res.status(400).send("Content is required");
  }

  try {
    const user = await findUserByAuth0Id(auth0Id);

    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: user.id,
      },
    });
    res.status(201).json(newPost);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the post" });
  }
});

// update a post - needs authentication
app.put("/posts/:id", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { content } = req.body;
  const { id } = req.params;

  try {
    const user = await findUserByAuth0Id(auth0Id);
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        author: true,
      },
    });

    if (!post || post.authorId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        content,
      },
    });
    res.json(updatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the post" });
  }
});

// delete a post - needs authentication
app.delete("/posts/:id", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { id } = req.params;

  try {
    const user = await findUserByAuth0Id(auth0Id);
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
    });

    if (!post || post.authorId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Added logic to delete related likes, comments, and then the post
    await prisma.$transaction(async (prisma) => {
      await prisma.like.deleteMany({
        where: { postId: Number(id) },
      });

      await prisma.comment.deleteMany({
        where: { postId: Number(id) },
      });

      await prisma.post.delete({
        where: { id: Number(id) },
      });
    });

    res.json({ message: "Post, likes, and comments deleted" });
  } catch (error) {
    console.error("Error deleting post, likes, and comments:", error);
    res.status(500).json({
      error: "An error occurred while deleting the post, likes, and comments",
    });
  }
});

/************* COMMENT *************/

// create a new comment
app.post("/posts/:postId/comments", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { content } = req.body;
  const { postId } = req.params;

  if (!content) {
    return res.status(400).send("Content is required");
  }

  try {
    const user = await findUserByAuth0Id(auth0Id);
    const newComment = await prisma.comment.create({
      data: {
        content,
        authorId: user.id,
        postId: Number(postId),
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while creating the comment" });
  }
});

// get comments for a specific post - needs authentication
app.get("/posts/:postId/comments", requireAuth, async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId: Number(postId) },
      include: {
        author: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(comments);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching comments" });
  }
});

// update a comment - needs authentication
app.put("/comments/:id", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { content } = req.body;
  const { id } = req.params;

  if (!content) {
    return res.status(400).send("Content is required");
  }

  try {
    const user = await findUserByAuth0Id(auth0Id);
    const comment = await prisma.comment.findUnique({
      where: { id: Number(id) },
      include: {
        author: true,
      },
    });

    if (!comment || comment.authorId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: Number(id) },
      data: {
        content,
      },
    });
    res.json(updatedComment);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the comment" });
  }
});

// delete a comment - needs authentication
app.delete("/comments/:id", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { id } = req.params;

  try {
    const user = await findUserByAuth0Id(auth0Id);
    const comment = await prisma.comment.findUnique({
      where: { id: Number(id) },
    });

    if (!comment || comment.authorId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.comment.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while deleting the comment" });
  }
});

/************* USER *************/

// getting user info
app.get("/user", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: req.auth.payload.sub },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// getting users posts
app.get("/user/posts", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        likes: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const postsWithCounts = posts.map((post) => {
      const isLikedByUser = post.likes.some((like) => like.userId === user.id);
      console.log(`Post ID: ${post.id}, isLikedByUser: ${isLikedByUser}`);
      return {
        ...post,
        commentsCount: post._count.comments,
        likesCount: post._count.likes,
        isLikedByUser,
      };
    });

    res.json(postsWithCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// updating user info: username or picture
app.put("/user", requireAuth, async (req, res) => {
  const { name, picture } = req.body;
  const auth0Id = req.auth.payload.sub;

  if (!name && !picture) {
    return res.status(400).json({ error: "No data to update" });
  }

  // regax to parse if picture format
  if (picture && !picture.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
    return res.status(400).json({ error: "Invalid picture format" });
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (picture) updateData.picture = picture;

  try {
    const user = await prisma.user.update({
      where: { auth0Id },
      data: updateData,
    });
    res.json(user);
  } catch (error) {
    console.error("Error updating user: ", error);
    res.status(500).json({ error: "An error occurred while adding the like" });
  }
});

/************* LIKES *************/

// adding a like form a post
app.post("/posts/:postId/likes", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { postId } = req.params;

  try {
    const user = await findUserByAuth0Id(auth0Id);

    // check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: Number(postId),
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      return res.status(400).json({ error: "Like already exists" });
    }

    const newLike = await prisma.like.create({
      data: {
        postId: Number(postId),
        userId: user.id,
      },
    });
    res.status(201).json(newLike);
  } catch (error) {
    console.error("Error adding like: ", error);
    res.status(500).json({ error: "An error occurred while adding the like" });
  }
});

// deleting a like from a post
app.delete("/posts/:postId/likes", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { postId } = req.params;

  try {
    const user = await findUserByAuth0Id(auth0Id);
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: Number(postId),
          userId: user.id,
        },
      },
    });
    res.status(200).json({ message: "Like removed" });
  } catch (error) {
    console.error("Error deleting like: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the like" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});
