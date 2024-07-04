import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Logo() {
  return (
    <div className="flex items-center justify-center">
      <Link to="/home" className="hover:bg-gray-200 p-1 rounded-full transition">
        <img src={logo} alt="Logo" className="w-12 h-12" />
      </Link>
    </div>
  );
}
