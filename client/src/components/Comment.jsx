import React, { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/AuthTokenContext";
import { useAuth0 } from "@auth0/auth0-react";
import { formatDate } from "../utils/formatDate";
import { IoEllipsisVertical, IoTrashOutline } from "react-icons/io5";

export default function Comment({ postId, refreshComments }) {
  const { accessToken } = useAuthToken();
  const { user } = useAuth0();
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState({});

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/posts/${postId}/comments`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const commentsData = await response.json();
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments: ", error);
        setError("Failed to fetch comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [accessToken, postId, refreshComments]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setDropdownVisible({});
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("Error deleting comment: ", error);
      setError("Failed to delete comment");
    }
  };

  const toggleDropdown = (commentId) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  if (loading) {
    return <div>Loading comments...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div
            key={comment.id}
            className="comment mb-4 p-4 border border-gray-200 rounded-lg relative"
          >
            <div className="comment-header flex items-center mb-2">
              <img
                src={comment.author.picture}
                alt={`${comment.author.name}'s avatar`}
                className="comment-avatar w-8 h-8 rounded-full mr-4"
              />
              <div className="comment-author">
                <small className="font-semibold">@{comment.author.name}</small>
                <span className="text-gray-500"> · </span>
                <small className="text-gray-500 text-sm">
                  {formatDate(comment.createdAt)}
                </small>
              </div>
              {user && comment.author.email === user.email && (
                <div className="ml-auto relative dropdown">
                  <IoEllipsisVertical
                    className="text-gray-500 cursor-pointer"
                    onClick={() => toggleDropdown(comment.id)}
                  />
                  {dropdownVisible[comment.id] && (
                    <div className="absolute right-0 top-full mt-2 w-24 bg-white border border-gray-200 rounded-lg shadow-md z-10">
                      <button
                        onClick={() => handleDelete(comment.id)}
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
            <p className="text-gray-800">{comment.content}</p>
          </div>
        ))
      )}
    </div>
  );
}
