import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Target, CalendarDays, MessageSquare, Eye } from "lucide-react";

const InfluencerNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-4 z-50 mx-auto mt-4 mb-8 w-full max-w-6xl rounded-full border border-white/10 bg-[#050916]/80 px-5 py-3 text-white shadow-lg shadow-black/40 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-600 to-purple-400 shadow-lg shadow-pink-900/40">
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">OneFame</span>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm md:flex">
          <Link className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white" to="/">
            Home
          </Link>
          <Link 
            className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white" 
            to="/influencer/dashboard"
          >
            Dashboard
          </Link>
          <Link 
            className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white flex items-center gap-1.5" 
            to="/influencer/campaigns"
          >
            <Target className="h-4 w-4" />
            Campaigns
          </Link>
          <Link 
            className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white" 
            to="/booking"
          >
            Booking
          </Link>
          <Link 
            className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white flex items-center gap-1.5" 
            to="/chat"
          >
            <MessageSquare className="h-4 w-4" />
            Messages
          </Link>
          <Link 
            className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white flex items-center gap-1.5" 
            to="/booking"
          >
            <Eye className="h-4 w-4" />
            Browse
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                ref={dropdownRef}
              >
                {user.profile_photo ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <img 
                      src={user.profile_photo} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'I'}
                  </div>
                )}
                <span>Hey, {user.name?.split(" ")[0] || 'Creator'}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/10 bg-[#080f1f] p-1 text-sm shadow-xl">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/influencer/profile");
                    }}
                    className="w-full rounded-xl px-4 py-3 text-left text-white/80 transition hover:bg-white/5"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full rounded-xl px-4 py-3 text-left text-white/80 transition hover:bg-white/5"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="text-sm font-semibold text-white/70 transition hover:text-white" to="/auth/Login">
                Login
              </Link>
              <Link
                className="rounded-full bg-gradient-to-r from-pink-600 to-purple-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-900/40 transition hover:scale-105"
                to="/auth/Signup"
              >
                Join now
              </Link>
            </>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur z-50">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl text-center backdrop-blur">
            <p className="mb-4 text-lg font-semibold text-white">Do you want to logout?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-400 text-white rounded-full font-semibold"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2 bg-white/10 text-white rounded-full font-semibold border border-white/20"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default InfluencerNavbar;

