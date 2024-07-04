import { useEffect } from "react";
import { useAuthToken } from "../contexts/AuthTokenContext";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "./Loading";

export default function VerifyUser() {
  const navigate = useNavigate();
  const { accessToken } = useAuthToken();
  const { logout } = useAuth0();

  useEffect(() => {
    async function verifyUser() {
      try {
        // console.log(accessToken);

        // make a call to our API to verify the user in our database, if it doesn't exist we'll insert it into our database
        // finally we'll redirect the user to the /app route
        const data = await fetch(
          `${process.env.REACT_APP_API_URL}/verify-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!data.ok) {
          throw new Error("Network response was not ok");
        }

        const user = await data.json();

        if (user.auth0Id) {
          navigate("/home");
        }
      } catch (error) { // catch the case when backend is not available
        console.error(error);
        logout({ returnTo: window.location.origin }); // Logout the user on error
      }
    }

    if (accessToken) {
      verifyUser();
    }
  }, [accessToken, navigate, logout]);

  return <Loading />;
}
