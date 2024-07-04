import React, { useState } from "react";
import Posts from "./Posts";
import CreatePost from "./CreatePost";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "./Loading";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const [refresh, setRefresh] = useState(false);
  const { isAuthenticated, isLoading } = useAuth0();

  const handlePostCreated = () => {
    setRefresh(!refresh); // toggle state to trigger re-fetch
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="px-6 py-4 min-h-screen">
      <Helmet>
        <title>Home / fakeX</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4">fakeX</h1>
      {!isAuthenticated && (
        <div
          className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded relative mb-4 text-sm w-full"
          role="alert"
        >
          <span className="block sm:inline">
            You are not logged in. Only the latest 5 posts are shown.
          </span>
        </div>
      )}
      {isAuthenticated && <CreatePost onPostCreated={handlePostCreated} />}
      <Posts refresh={refresh} />
    </div>
  );
}
