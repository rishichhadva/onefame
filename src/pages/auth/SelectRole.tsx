import React, { useState } from "react";
import { apiUrl } from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Briefcase, Megaphone, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SelectRole = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [role, setRole] = useState<"influencer" | "provider" | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!role) {
      setError("Please select your role to continue");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please log in again.");
        setTimeout(() => navigate("/auth/Login"), 1500);
        return;
      }

      // Update role
      const res = await fetch(apiUrl("/api/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to update role" }));
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          setTimeout(() => navigate("/auth/Login"), 1500);
          return;
        }
        throw new Error(data.error || "Failed to update role");
      }

      // Refresh user data and update context (only if update was successful)
      try {
        const profileRes = await fetch(apiUrl("/api/profile"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
        }
      } catch (profileErr) {
        // If profile fetch fails, still proceed with redirect
        console.warn("Failed to fetch updated profile:", profileErr);
      }
      
      // Redirect to dashboard based on role
      const redirectPath = role === "provider" 
        ? "/provider/dashboard" 
        : role === "influencer" 
        ? "/influencer/dashboard" 
        : "/dashboard";
      
      setTimeout(() => {
        navigate(location.state?.from || redirectPath);
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to save role");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#01030a] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 left-0 h-80 w-80 rounded-full bg-blue-500 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-80 w-64 rounded-full bg-purple-600 blur-[150px]" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <div className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-white/70 mb-4">
                <Sparkles className="h-4 w-4" />
                welcome to onefame
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-3">
                Choose your path
              </h1>
              <p className="text-white/60">
                Select whether you want to be a Provider or Influencer to get started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole("influencer")}
                disabled={loading}
                className={`group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 p-8 transition-all ${
                  role === "influencer"
                    ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20"
                    : "border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className={`rounded-xl p-4 ${
                  role === "influencer" ? "bg-cyan-400/20" : "bg-white/5"
                }`}>
                  <Megaphone className={`h-8 w-8 ${
                    role === "influencer" ? "text-cyan-300" : "text-white/50"
                  }`} />
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold mb-2 ${
                    role === "influencer" ? "text-white" : "text-white/70"
                  }`}>
                    Influencer
                  </p>
                  <p className="text-sm text-white/50">
                    Create content, collaborate with brands, and grow your audience
                  </p>
                </div>
                {role === "influencer" && (
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-cyan-400 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRole("provider")}
                disabled={loading}
                className={`group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 p-8 transition-all ${
                  role === "provider"
                    ? "border-purple-400 bg-purple-400/10 shadow-lg shadow-purple-400/20"
                    : "border-white/10 bg-white/5 hover:border-purple-400/40 hover:bg-white/10"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className={`rounded-xl p-4 ${
                  role === "provider" ? "bg-purple-400/20" : "bg-white/5"
                }`}>
                  <Briefcase className={`h-8 w-8 ${
                    role === "provider" ? "text-purple-300" : "text-white/50"
                  }`} />
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold mb-2 ${
                    role === "provider" ? "text-white" : "text-white/70"
                  }`}>
                    Provider
                  </p>
                  <p className="text-sm text-white/50">
                    Offer services, get bookings, and connect with creators
                  </p>
                </div>
                {role === "provider" && (
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-purple-400 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-center text-sm text-rose-200">
                {error}
              </div>
            )}

            {!role && (
              <p className="mb-6 text-center text-sm text-rose-400/80">
                Please select your role to continue
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!role || loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-4 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;

