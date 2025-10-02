import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  return (
    <nav className="bg-white/90 backdrop-blur-lg shadow-lg px-6 py-3 flex justify-between items-center rounded-xl mx-4 mt-4 mb-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <svg width="32" height="32" viewBox="0 0 32 32" className="rounded-lg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#logoGradient)" />
            <path d="M16 8l4 8-4 8-4-8z" fill="white" opacity="0.9" />
            <circle cx="16" cy="12" r="2" fill="white" />
          </svg>
        </div>
        <span className="font-extrabold text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent tracking-tight">OneFame</span>
      </div>
      <div className="flex gap-2 items-center">
        <Link to="/" className="px-5 py-2 rounded-md text-gray-700 hover:bg-pink-100 hover:text-pink-600 transition font-medium">Home</Link>
        <Link to="/search" className="px-5 py-2 rounded-md text-gray-700 hover:bg-pink-100 hover:text-pink-600 transition font-medium">Search</Link>
        {user ? (
          <>
            <span
              className="ml-2 px-5 py-2 rounded-full bg-pink-100 text-pink-700 font-bold cursor-pointer relative"
              onClick={() => setDropdownOpen((open) => !open)}
              ref={dropdownRef}
            >
              Hey, {user.name}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'influencer' ? '/influencer/dashboard' : user.role === 'provider' ? '/provider/dashboard' : '/user/dashboard'); }}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-pink-100 text-pink-700 font-medium"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { logout(); navigate('/'); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-pink-100 text-gray-700 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </span>
          </>
        ) : (
          <>
            <Link to="/auth/Login" className="px-5 py-2 rounded-md text-gray-700 hover:bg-pink-100 hover:text-pink-600 transition font-medium">Login</Link>
            <Link to="/auth/Signup" className="px-5 py-2 rounded-md bg-gradient-to-r from-pink-500 to-purple-400 text-white font-semibold shadow transition hover:bg-gradient-to-r hover:from-pink-700 hover:to-purple-600">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
