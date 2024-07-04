import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function App() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="w-full md:w-1/5 xl:w-1/5 p-4 flex-shrink-0">
        <NavBar />
      </aside>
      <main className="flex-grow p-4 border-r border-l border-gray-200">
        <div className="max-w-2xl mx-auto min-h-screen">
          <Outlet /> {/* place holder for rendering other components */}
        </div>
      </main>
      <aside className="w-full md:w-1/5 xl:w-2/5 p-4 flex-shrink-0">
        {/* PLACEHOLDER */}
      </aside>
    </div>
  );
}
