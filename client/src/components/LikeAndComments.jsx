import React, { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/AuthTokenContext";
import { IoHeartOutline, IoHeart, IoChatbubbleOutline } from "react-icons/io5";

export default function LikeAndComments({
  postId,
  initialLikes,
  initialComments,
  isLikedByUser,
  isAuthenticated,
}) {
  const { accessToken } = useAuthToken();
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [commentsCount] = useState(initialComments);
  const [isLiked, setIsLiked] = useState(isLikedByUser);

  // useEffect to sync isLiked state with isLikedByUser prop
  useEffect(() => {
    setIsLiked(isLikedByUser);
  }, [isLikedByUser]);

  // console.log("Component initial isLikedByUser:", isLikedByUser);
  // console.log("Component initial isAuthenticated:", isAuthenticated);

  const handleLike = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking like button
    if (!isAuthenticated) return; // Do nothing if not authenticated

    const url = `${process.env.REACT_APP_API_URL}/posts/${postId}/likes`;
    const method = isLiked ? "DELETE" : "POST";

    // console.log("METHOD: ", method);
    // console.log("isLiked before request:", isLiked);
    // console.log("Sending request to:", url, "with method:", method);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Response not ok:", errorData);
        throw new Error("Failed to update like");
      }

      setLikesCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));
      setIsLiked((prev) => !prev);
      console.log("isLiked after request:", !isLiked);
    } catch (error) {
      console.error("Error updating like: ", error);
    }
  };

  return (
    <div
      className="flex items-center space-x-4 mt-2"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleLike}
        className="text-gray-500 flex items-center space-x-1"
        disabled={!isAuthenticated}
      >
        {isLiked ? <IoHeart className="text-red-500" /> : <IoHeartOutline />}
        <span>{likesCount}</span>
      </button>
      <div className="text-gray-500 flex items-center space-x-1">
        <IoChatbubbleOutline />
        <span>{commentsCount}</span>
      </div>
    </div>
  );
}
