import React from "react";
import { useNavigate } from "react-router-dom";
import usePosts from "../hook/usePosts";
import { useAuth0 } from "@auth0/auth0-react";
import { formatDate } from "../utils/formatDate";
import LikeAndComments from "./LikeAndComments";

export default function Posts({ refresh }) {
  const { isAuthenticated } = useAuth0();
  const [posts] = usePosts(refresh);
  const navigate = useNavigate();

  const handleCardClick = (postId) => {
    if (isAuthenticated) {
      navigate(`/posts/${postId}`);
    }
  };

  // console.log("Posts data:", posts);

  return (
    <div className="mt-4 w-full">
      <h2 className="text-xl font-bold mb-4">Posts</h2>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post.id}
            className={`post mb-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-100 transition ${isAuthenticated ? 'cursor-pointer' : ''}`}
            onClick={() => handleCardClick(post.id)}
          >
            <div className="post-header flex items-center mb-2">
              <img
                src={post.author.picture}
                alt={`${post.author.name}'s avatar`}
                className="post-avatar w-10 h-10 rounded-full mr-4"
              />
              <div className="post-author">
                <small className="font-semibold">
                  @{post.author.name}
                </small>
                <span className="text-gray-500"> · </span>
                <small className="text-gray-500 text-sm">
                  {formatDate(post.createdAt)}
                </small>
              </div>
            </div>
            <p className="text-gray-800">{post.content}</p>
            <div onClick={(e) => e.stopPropagation()}>
              <LikeAndComments
                postId={post.id}
                initialLikes={post.likesCount}
                initialComments={post.commentsCount}
                isLikedByUser={post.isLikedByUser}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="text-md text-gray-500">No posts available</p>
      )}
    </div>
  );
}
