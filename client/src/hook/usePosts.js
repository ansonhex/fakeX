import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/AuthTokenContext";

export default function usePosts(refresh) {
  const [posts, setPosts] = useState([]);
  const { accessToken } = useAuthToken();

  useEffect(() => {
    async function getPostsFromApi() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/posts`, {
          method: "GET",
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`, // if accessToken
              }
            : {}, // if no accessToken, anonymous get
        });
        const postsData = await response.json();
        setPosts(postsData);
      } catch (error) {
        console.error("Failed to fetch posts: ", error);
      }
    }

    getPostsFromApi();
  }, [accessToken, refresh]); // also fetch when refresh changes

  return [posts, setPosts];
}
