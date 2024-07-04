import React, { useState, useRef } from "react";
import { useAuthToken } from "../contexts/AuthTokenContext";
import useUser from "../hook/useUser";

export default function CreateComment({ postId, onCommentCreated, postAuthor }) {
  const { accessToken } = useAuthToken();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const maxLength = 280;
  const { userData, loading: userLoading } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) {
      setError("Content is required");
      return;
    }
    if (content.length > maxLength) {
      setError(`Content should not exceed ${maxLength} characters`);
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      const commentData = await response.json();
      // console.log("Comment created: ", commentData);
      setContent("");
      onCommentCreated(); // pass back up to parent
    } catch (error) {
      console.error("Error creating comment: ", error);
      setError("Failed to create comment");
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e) => {
    setContent(e.target.value);
    textareaRef.current.style.height = "auto"; // Reset height
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust height
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="px-6 py-4 bg-white border border-gray-300 rounded-lg shadow-sm">
        {userLoading ? (
          <div>Loading user data...</div>
        ) : (
          <div>
            <p className=" ml-16 text-gray-400 text-sm font-normal">Replying to @{postAuthor}</p>
          <form onSubmit={handleSubmit} className="flex items-start space-x-4">
            <img
              src={userData.picture}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-grow">
              <textarea
                ref={textareaRef}
                className="w-full p-2 text-base placeholder-gray-500 border-none focus:ring-0 resize-none overflow-hidden focus:outline-none"
                value={content}
                onChange={handleTextareaChange}
                placeholder="Post your reply"
                maxLength={maxLength}
                style={{ height: "auto" }}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {content.length}/{maxLength}
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-white font-semibold rounded-full text-xs ${
                    loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Replying..." : "Reply"}
                </button>
              </div>
              {error && <p className="error text-red-500 mt-2">{error}</p>}
            </div>
          </form>
          </div>
        )}
      </div>
    </div>
  );
}
