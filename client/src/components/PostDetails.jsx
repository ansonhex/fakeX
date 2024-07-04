import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthToken } from "../contexts/AuthTokenContext";
import { useAuth0 } from "@auth0/auth0-react";
import {
  IoArrowBackOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoEllipsisVertical,
} from "react-icons/io5";
import CreateComment from "./CreateComment";
import Comment from "./Comment";
import { formatDate } from "../utils/formatDate";
import LikeAndComments from "./LikeAndComments";
import Loading from "./Loading";
import { Helmet } from "react-helmet-async";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuthToken();
  const { user } = useAuth0();
  const [post, setPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [error, setError] = useState("");
  const [postNotFound, setPostNotFound] = useState(false);
  const [refreshComments, setRefreshComments] = useState(false);
  const textareaRef = useRef(null);
  const maxLength = 280;
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const getPostFromApi = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/posts/${id}`,
          {
            method: "GET",
            headers: accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`, // if accessToken
                }
              : {}, // if no accessToken, anonymous get
          }
        );
        if (!response.ok) {
          setPostNotFound(true);
          return;
        }

        const postData = await response.json();
        // console.log("Fetched post data:", postData);
        setPost(postData);
        setEditedContent(postData.content);
      } catch (error) {
        console.error("Failed to fetch post: ", error);
        setPostNotFound(true);
      }
    };

    if (id && accessToken) {
      getPostFromApi();
    }
  }, [accessToken, id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editedContent) {
      setError("Content is required");
      return;
    }
    if (editedContent.length > maxLength) {
      setError(`Content should not exceed ${maxLength} characters`);
      return;
    }
    setError("");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/posts/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content: editedContent }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit post");
      }

      const updatedPost = await response.json();
      setPost((prevPost) => ({
        ...updatedPost,
        author: prevPost.author, // keep author info unchanged
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing post: ", error);
      setError("Failed to edit post");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/posts/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      navigate("/home");
    } catch (error) {
      console.error("error deleting post: ", error);
      setError("Failed to delete post");
    }
  };

  if (postNotFound) {
    navigate("/home");
  }

  const handleTextareaChange = (e) => {
    setEditedContent(e.target.value);
    textareaRef.current.style.height = "auto"; // Reset height
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust height
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Loading... */}
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {post.author.name} on fakeX: {post.content}
        </title>
      </Helmet>
      <div className="post-details max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Post Details</h2>
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center space-x-2 px-4 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300"
        >
          <IoArrowBackOutline className="text-md" />
          <span className="text-sm">Back</span>
        </button>
        <div className="post mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="post-header flex items-center mb-2">
            {post.author && (
              <>
                <img
                  src={post.author.picture}
                  alt={`${post.author.name}'s avatar`}
                  className="post-avatar w-10 h-10 rounded-full mr-4"
                />
                <div className="post-author">
                  <small className="font-semibold">@{post.author.name}</small>
                  <span className="text-gray-500"> · </span>
                  <small className="text-gray-500 text-sm">
                    {formatDate(post.createdAt)}
                  </small>
                </div>
              </>
            )}
            {user && post.author && user.email === post.author.email && (
              <div className="ml-auto relative dropdown">
                <IoEllipsisVertical
                  className="text-gray-500 cursor-pointer"
                  onClick={toggleDropdown}
                />
                {dropdownVisible && (
                  <div className="absolute right-0 top-full mt-2 w-24 bg-white border border-gray-200 rounded-lg shadow-md z-10">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
                    >
                      <IoPencilOutline className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 rounded-lg flex items-center"
                    >
                      <IoTrashOutline className="mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {isEditing ? (
            <form onSubmit={handleEdit} className="space-y-4">
              <textarea
                ref={textareaRef}
                value={editedContent}
                onChange={handleTextareaChange}
                className="w-full p-2 text-lg placeholder-gray-500 border-none focus:ring-0 resize-none overflow-hidden focus:outline-none"
                maxLength={maxLength}
                style={{ height: "auto" }}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {editedContent.length}/{maxLength}
                </span>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
              {error && <p className="error text-red-500 mt-2">{error}</p>}
            </form>
          ) : (
            <>
              <p className="text-gray-800">{post.content}</p>
              <LikeAndComments
                postId={post.id}
                initialLikes={post.likesCount}
                initialComments={post.commentsCount}
                isLikedByUser={post.isLikedByUser}
                isAuthenticated={!!user}
              />
            </>
          )}
        </div>
      </div>
      {/* COMMENT */}
      <CreateComment
        postId={id}
        onCommentCreated={() => setRefreshComments((prev) => !prev)}
        postAuthor={post.author.name}
      />
      <Comment postId={id} refreshComments={refreshComments} />
    </>
  );
}
