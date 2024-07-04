import React, { useState } from "react";
import useUser from "../hook/useUser";
import useUserPosts from "../hook/useUserPosts";
import { formatDate } from "../utils/formatDate";
import LikeAndComments from "./LikeAndComments";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import EditProfileDialog from "./EditProfileDialog";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

export default function Profile() {
  const { isAuthenticated } = useAuth0();
  const {
    userData,
    loading: userLoading,
    error: userError,
    fetchUserData,
  } = useUser();
  const [refresh, setRefresh] = useState(false);
  const {
    posts,
    loading: postsLoading,
    error: postsError,
  } = useUserPosts(refresh);
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (userLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (userError || postsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{userError || postsError}</p>
      </div>
    );
  }

  const handleCardClick = (postId) => {
    if (isAuthenticated) {
      navigate(`/posts/${postId}`);
    }
  };

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    fetchUserData(); // re-render user data
    setRefresh(!refresh); // Toggle the refresh state to reload posts
  };

  const joinDate = new Date(userData.createdAt);
  const joinMonthYear = joinDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-6 py-4 min-h-screen">
      <Helmet>
        <title>@{userData.name} / fakeX</title>
      </Helmet>
      <div className="profile-header mb-4">
        <div className="profile-info flex items-center mb-4">
          <img
            src={userData.picture}
            alt={`${userData.name}'s avatar`}
            className="profile-avatar w-20 h-20 rounded-full mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold">@{userData.name}</h1>
            <p className="text-gray-500">{userData.email}</p>
          </div>
          <button
            className="ml-auto px-4 py-2 border border-gray-300 text-black rounded-full hover:bg-gray-200 transition font-semibold text-sm"
            onClick={handleEditProfile}
          >
            Edit Profile
          </button>
        </div>
        <p className="text-gray-500 text-md font-normal">
          <span className="inline-flex items-center">
            <FaRegCalendarAlt className="mr-1" />
            Joined {joinMonthYear}
          </span>
        </p>
      </div>
      <h2 className="text-xl font-bold mb-4">Posts</h2>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post.id}
            className={`post mb-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-100 transition ${
              isAuthenticated ? "cursor-pointer" : ""
            }`}
            onClick={() => handleCardClick(post.id)}
          >
            <div className="post-header flex items-center mb-2">
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
      {isEditDialogOpen && (
        <EditProfileDialog
          userData={userData}
          onClose={handleCloseEditDialog}
        />
      )}
    </div>
  );
}
