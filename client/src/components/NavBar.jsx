import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Login from "./Login";
import { IoHomeOutline, IoHomeSharp } from "react-icons/io5";
import { FaUser, FaRegUser } from "react-icons/fa";
import Logo from "./Logo";

export default function NavBar() {
  const { isAuthenticated } = useAuth0();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div>
      <Logo />
      <nav className="p-4">
        <div className="mb-8">
          <Login />
        </div>
        <hr />
        <ul className="flex flex-col space-y-1 text-xl py-5">
          <li
            className={`flex items-center py-2 ml-12 ${
              isActive("/home") ? "text-black font-bold" : "text-gray-800"
            }`}
          >
            <Link
              to="/home"
              className={`flex items-center space-x-2 rounded-full py-3 px-4 ${
                isActive("/home") ? "" : "hover:bg-gray-200"
              }`}
            >
              {isActive("/home") ? (
                <IoHomeSharp className="text-black" />
              ) : (
                <IoHomeOutline className="text-gray-800" />
              )}
              <span className="sm:inline md:hidden lg:inline">Home</span>
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li
                className={`flex items-center py-2 ml-12 ${
                  isActive("/profile")
                    ? "text-black font-bold"
                    : "text-gray-800"
                }`}
              >
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 rounded-full py-3 px-4 ${
                    isActive("/profile") ? "" : "hover:bg-gray-200"
                  }`}
                >
                  {isActive("/profile") ? (
                    <FaUser className="text-black" />
                  ) : (
                    <FaRegUser className="text-gray-800" />
                  )}
                  <span className="sm:inline md:hidden lg:inline">Profile</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}
