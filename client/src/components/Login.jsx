import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { FaSignInAlt, FaUserPlus, FaSignOutAlt } from "react-icons/fa";

export default function Login() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const signUp = () =>
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
      },
    });

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <div className="flex flex-col space-y-4">
      {!isAuthenticated ? (
        <>
          <button
            onClick={loginWithRedirect}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-black rounded-full hover:bg-gray-200 transition"
          >
            <FaSignInAlt /> <span>Login</span>
          </button>
          <button
            onClick={signUp}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-black rounded-full hover:bg-gray-200 transition"
          >
            <FaUserPlus /> <span>Sign Up</span>
          </button>
        </>
      ) : (
        <>
          <button
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-black rounded-full hover:bg-gray-200 transition"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </>
      )}
    </div>
  );
}
