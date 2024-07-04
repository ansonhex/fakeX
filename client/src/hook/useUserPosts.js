import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/AuthTokenContext";

export default function useUserPosts(refresh) {
  const { accessToken } = useAuthToken();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserPosts() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/user/posts`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) {
      fetchUserPosts();
    }
  }, [accessToken, refresh]);

  return { posts, loading, error };
}
