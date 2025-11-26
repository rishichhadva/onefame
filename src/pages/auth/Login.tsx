import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Smartphone, Sparkles, ArrowRight } from "lucide-react";

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState("");
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPopup("");
    try {
      // Always use the backend login endpoint, even for admin
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      // Store the real JWT token from backend
      if (!data.token) {
        throw new Error("No token received from server");
      }
      
      localStorage.setItem("token", data.token);
      
      // Fetch user profile to get full user data
      const profileRes = await fetch("http://localhost:4000/api/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${data.token}` },
      });
      
      if (!profileRes.ok) {
        throw new Error("Failed to fetch user profile");
      }
      
      const profileData = await profileRes.json();
      const profile = profileData.user || profileData || data.user;
      
      setUser(profile);
      
      // Redirect based on role
      if (profile.role === 'admin') {
        setPopup("Logged in as admin! Redirecting...");
        setTimeout(() => navigate("/admin/dashboard"), 1200);
      } else {
        setPopup("Logged in successfully! Redirecting...");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (err: any) {
      setPopup(err.message || "Login failed");
    }
  };

  const handleGoogle = async () => {
    try {
      setPopup("");
      const provider = new GoogleAuthProvider();
      
      // Try popup first, fallback to redirect if blocked
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        // If popup is blocked, use redirect instead
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          setPopup("Popup blocked. Redirecting to Google sign-in...");
          await signInWithRedirect(auth, provider);
          return; // signInWithRedirect will navigate away, so we return here
        }
        throw popupError; // Re-throw if it's a different error
      }
      
      const idToken = await result.user.getIdToken();
      const res = await fetch("http://localhost:4000/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auth failed");
      localStorage.setItem("token", data.token);
      setUser(data.user);
      
      // Redirect to role selection if user needs to choose role
      if (data.needsRoleSelection) {
        setPopup("Please select your role to continue...");
        setTimeout(() => navigate("/auth/select-role", { state: { from: "/" } }), 1000);
      } else {
        setPopup("Logged in with Google! Redirecting...");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      if (err.code === 'auth/popup-blocked') {
        setPopup("Popup was blocked. Please allow popups for this site and try again, or use email/password login.");
      } else {
        setPopup(err.message || "Google sign-in failed");
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020510] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-16 -top-32 h-72 w-72 rounded-full bg-purple-600 blur-[140px]" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500 blur-[140px]" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-lg lg:grid-cols-[1.1fr,0.9fr]">
          <div className="hidden flex-col gap-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-500 p-10 text-white lg:flex">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-white/70">
              <Sparkles className="h-4 w-4" />
              creator access
            </div>
            <h2 className="text-4xl font-black leading-tight">Login & pick up where your collabs left off.</h2>
            <p className="text-white/80">
              Manage bookings, answer briefs, and stay synced with brands without leaving OneFame. Secure auth keeps every conversation private.
            </p>
            <div className="rounded-2xl bg-white/15 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">why creators love it</p>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                <li>• All chats and invoices in one feed</li>
                <li>• Onboard once, reuse everywhere</li>
                <li>• Real-time signals for payments & briefs</li>
              </ul>
            </div>
          </div>
          <div className="bg-[#050713]/80 p-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">welcome back</p>
              <h1 className="mt-2 text-3xl font-semibold">Sign in to OneFame</h1>
              <p className="text-sm text-white/60">Enter your credentials to access the dashboard.</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-white/70">
                Email
                <div className="mt-2 flex items-center rounded-2xl border border-white/15 bg-white/5 px-4">
                  <Mail className="mr-3 h-4 w-4 text-white/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                    className="h-12 flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>
              </label>
              <label className="block text-sm font-medium text-white/70">
                Password
                <div className="mt-2 flex items-center rounded-2xl border border-white/15 bg-white/5 px-4">
                  <Lock className="mr-3 h-4 w-4 text-white/50" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-12 flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:-translate-y-0.5"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5"
              >
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => navigate("/auth/PhoneLogin")}
                className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5 flex items-center justify-center gap-2"
              >
                <Smartphone className="h-4 w-4" />
                Continue with phone
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@onefame.com");
                  setPassword("admin12");
                  setPopup("");
                }}
                className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5 flex items-center justify-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Admin access
              </button>
              {popup && (
                <div
                  className={`rounded-2xl px-4 py-3 text-center text-sm ${
                    popup.toLowerCase().includes("success")
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-rose-500/10 text-rose-200"
                  }`}
                >
                  {popup}
                </div>
              )}
            </form>
            <div className="mt-6 flex flex-col gap-2 text-sm text-white/60">
              <button onClick={() => navigate("/auth/Signup")} className="text-white hover:text-cyan-300">
                Need an account? <span className="font-semibold">Create one</span>
              </button>
              <button onClick={() => navigate("/auth/ForgotPassword")} className="text-white/50 hover:text-white">
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
