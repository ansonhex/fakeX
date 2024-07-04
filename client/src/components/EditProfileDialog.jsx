import React, { useState } from "react";
import { useAuthToken } from "../contexts/AuthTokenContext";

export default function EditProfileDialog({ userData, onClose }) {
  const { accessToken } = useAuthToken();
  const [name, setName] = useState(userData.name);
  const [picture, setPicture] = useState(userData.picture);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const updateData = {};
    if (name !== userData.name) updateData.name = name;
    if (picture !== userData.picture) updateData.picture = picture;

    if (!updateData.name && !updateData.picture) {
      setError("No changes to update");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      // console.log("Profile updated: ", updatedUser);
      onClose();
    } catch (error) {
      console.error("Error updating profile: ", error);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Picture URL
            </label>
            <label className="block text-xs font-semibold text-gray-500">
              Supports jpeg | jpg | gif | png | webp filename extension
            </label>
            <input
              type="text"
              value={picture}
              onChange={(e) => setPicture(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white font-semibold rounded-full text-sm ${
                loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
