import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/AuthTokenContext";

export default function useComments(postId, refreshComments) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthToken();

  useEffect(() => {
    async function getCommentsFromApi() {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}/comments`, {
          method: "GET",
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {},
        });
        const commentsData = await response.json();
        setComments(commentsData);
      } catch (error) {
        console.error("Failed to fetch comments: ", error);
      } finally {
        setLoading(false);
      }
    }

    if (postId) {
      getCommentsFromApi();
    }
  }, [postId, accessToken, refreshComments]);

  return [comments, loading, setComments];
}
