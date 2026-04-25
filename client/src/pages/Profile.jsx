// src/pages/Profile.jsx

import { useState } from "react";
import { User, Mail, Shield, Save } from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [user, setUser] = useState({
    name: storedUser.name || "",
    email: storedUser.email || "",
    role: storedUser.role || "user",
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(user));
    toast.success("Profile updated successfully");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        My Profile
      </h1>

      {/* Card */}
      <div className="max-w-3xl bg-white rounded-3xl shadow-lg p-8">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {user.name}
            </h2>
            <p className="text-gray-500">
              {user.email}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="text-sm text-gray-500 mb-2 block">
              Full Name
            </label>

            <div className="flex items-center border rounded-xl px-4 py-3 bg-gray-50">
              <User size={18} className="text-gray-400 mr-2" />

              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-500 mb-2 block">
              Email Address
            </label>

            <div className="flex items-center border rounded-xl px-4 py-3 bg-gray-50">
              <Mail size={18} className="text-gray-400 mr-2" />

              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-sm text-gray-500 mb-2 block">
              Account Role
            </label>

            <div className="flex items-center border rounded-xl px-4 py-3 bg-gray-100">
              <Shield size={18} className="text-gray-400 mr-2" />

              <input
                type="text"
                value={user.role}
                disabled
                className="w-full bg-transparent outline-none capitalize"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;