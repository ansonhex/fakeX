import { useState, useEffect, useCallback } from "react";
import { useAuthToken } from "../contexts/AuthTokenContext";

export default function useUser() {
  const { accessToken } = useAuthToken();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUserData(userData);
      setError(null);
    } catch (error) {
      console.error("Error fetching user data: ", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchUserData();
    }
  }, [accessToken, fetchUserData]);

  return { userData, error, loading, fetchUserData };
}
