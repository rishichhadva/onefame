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
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <span className="font-extrabold text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">OneFame</span>
      </div>
      <div className="flex gap-2 items-center">
        <Link to="/" className="px-5 py-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition font-medium">Home</Link>
        <Link to="/search" className="px-5 py-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition font-medium">Search</Link>
        {user ? (
          <>
            <span
              className="ml-2 px-5 py-2 rounded-full bg-blue-100 text-blue-700 font-bold cursor-pointer relative"
              onClick={() => setDropdownOpen((open) => !open)}
              ref={dropdownRef}
            >
              Hey, {user.name}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'influencer' ? '/influencer/dashboard' : user.role === 'provider' ? '/provider/dashboard' : '/user/dashboard'); }}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-blue-100 text-blue-700 font-medium"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { logout(); navigate('/'); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-blue-100 text-gray-700 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </span>
          </>
        ) : (
          <>
            <Link to="/auth/Login" className="px-5 py-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition font-medium">Login</Link>
            <Link to="/auth/Signup" className="px-5 py-2 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow transition hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
