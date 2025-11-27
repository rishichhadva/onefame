import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Lock, Users, Sparkles, ArrowRight, Briefcase, Megaphone } from "lucide-react";
import { apiUrl } from "@/lib/api";

const Signup = () => {
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"influencer" | "provider" | "">("");
  const [popup, setPopup] = useState("");
  const navigate = useNavigate();

  // Handle redirect result when user returns from Google sign-in
  React.useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Retrieve role from sessionStorage if it was stored before redirect
          const pendingRole = sessionStorage.getItem('pendingRole') as "influencer" | "provider" | null;
          sessionStorage.removeItem('pendingRole');
          
          const idToken = await result.user.getIdToken();
          const res = await fetch(apiUrl("/api/auth/firebase"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken, role: pendingRole }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Google sign-up failed");
          
          localStorage.setItem("token", data.token);
          setUser(data.user);
          
          if (data.needsRoleSelection) {
            setPopup("Please complete your profile...");
            setTimeout(() => navigate("/auth/select-role", { state: { from: "/" } }), 1000);
          } else {
            setPopup("Signed up with Google! Redirecting...");
            setTimeout(() => navigate("/"), 1000);
          }
        }
      } catch (err: any) {
        console.error("Redirect result error:", err);
        setPopup(err.message || "Google sign-up failed");
      }
    };
    handleRedirectResult();
  }, [navigate, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPopup("");
    if (!role) {
      setPopup("Please select whether you want to be a Provider or Influencer");
      return;
    }
    if (password !== confirmPassword) {
      setPopup("Passwords do not match");
      return;
    }
    try {
      const res = await fetch(apiUrl("/api/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      setPopup("Signup successful! Redirecting...");
      setTimeout(() => navigate("/auth/Login", { state: { email } }), 1200);
    } catch (err: any) {
      setPopup(err.message || "Signup failed");
    }
  };

  const handleGoogleSignup = async () => {
    if (!role) {
      setPopup("Please select whether you want to be a Provider or Influencer first");
      return;
    }

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
          // Store role in sessionStorage so we can retrieve it after redirect
          sessionStorage.setItem('pendingRole', role);
          await signInWithRedirect(auth, provider);
          return; // signInWithRedirect will navigate away, so we return here
        }
        throw popupError; // Re-throw if it's a different error
      }
      
      const idToken = await result.user.getIdToken();
      
      // Send to backend with role
      const res = await fetch(apiUrl("/api/auth/firebase"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google sign-up failed");
      
      localStorage.setItem("token", data.token);
      setUser(data.user);
      
      // If user still needs role selection, redirect
      if (data.needsRoleSelection) {
        setPopup("Please complete your profile...");
        setTimeout(() => navigate("/auth/select-role", { state: { from: "/" } }), 1000);
      } else {
        setPopup("Signed up with Google! Redirecting...");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (err: any) {
      console.error("Google sign-up error:", err);
      if (err.code === 'auth/popup-blocked') {
        setPopup("Popup was blocked. Please allow popups for this site and try again, or use email/password signup.");
      } else {
        setPopup(err.message || "Google sign-up failed");
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#01030a] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 left-0 h-80 w-80 rounded-full bg-blue-500 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-80 w-64 rounded-full bg-purple-600 blur-[150px]" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-lg lg:grid-cols-[0.95fr,1.05fr]">
          <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-10 text-white">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-white/70">
              <Sparkles className="h-4 w-4" />
              join the roster
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight">Creators & providers grow faster on OneFame.</h1>
            <p className="mt-4 text-white/80">
              Showcase your offer, access premium briefs, and get paid faster. Pick your lane below and we handle the rest.
            </p>
            <div className="mt-8 space-y-4 rounded-3xl bg-white/15 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">why apply</p>
              <ul className="space-y-2 text-sm text-white/90">
                <li>• Verified profiles appear in search instantly</li>
                <li>• Built-in contracts and escrow for every booking</li>
                <li>• Analytics to understand who’s viewing your profile</li>
              </ul>
            </div>
          </div>
          <div className="bg-[#070914]/80 p-8">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">create account</p>
              <h2 className="mt-2 text-3xl font-semibold">Let’s get you onboarded</h2>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-white/70">
                Full name
                <div className="mt-2 flex items-center rounded-2xl border border-white/15 bg-white/5 px-4">
                  <User className="mr-3 h-4 w-4 text-white/50" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tell us who you are"
                    autoComplete="name"
                    className="h-12 flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>
              </label>
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
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-white/70">
                  Password
                  <div className="mt-2 flex items-center rounded-2xl border border-white/15 bg-white/5 px-4">
                    <Lock className="mr-3 h-4 w-4 text-white/50" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-12 flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>
                </label>
                <label className="block text-sm font-medium text-white/70">
                  Confirm password
                  <div className="mt-2 flex items-center rounded-2xl border border-white/15 bg-white/5 px-4">
                    <Lock className="mr-3 h-4 w-4 text-white/50" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-12 flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>
                </label>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/70">
                  I want to be a... <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("influencer")}
                    className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 transition-all ${
                      role === "influencer"
                        ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20"
                        : "border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10"
                    }`}
                  >
                    <div className={`rounded-xl p-3 ${
                      role === "influencer" ? "bg-cyan-400/20" : "bg-white/5"
                    }`}>
                      <Megaphone className={`h-6 w-6 ${
                        role === "influencer" ? "text-cyan-300" : "text-white/50"
                      }`} />
                    </div>
                    <div className="text-center">
                      <p className={`font-bold ${
                        role === "influencer" ? "text-white" : "text-white/70"
                      }`}>
                        Influencer
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        Create content & collaborate
                      </p>
                    </div>
                    {role === "influencer" && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-cyan-400 flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("provider")}
                    className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 transition-all ${
                      role === "provider"
                        ? "border-purple-400 bg-purple-400/10 shadow-lg shadow-purple-400/20"
                        : "border-white/10 bg-white/5 hover:border-purple-400/40 hover:bg-white/10"
                    }`}
                  >
                    <div className={`rounded-xl p-3 ${
                      role === "provider" ? "bg-purple-400/20" : "bg-white/5"
                    }`}>
                      <Briefcase className={`h-6 w-6 ${
                        role === "provider" ? "text-purple-300" : "text-white/50"
                      }`} />
                    </div>
                    <div className="text-center">
                      <p className={`font-bold ${
                        role === "provider" ? "text-white" : "text-white/70"
                      }`}>
                        Provider
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        Offer services & get bookings
                      </p>
                    </div>
                    {role === "provider" && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-purple-400 flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
                {!role && (
                  <p className="text-xs text-rose-400/80">Please select your role to continue</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-4 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5"
              >
                Create account
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#070914] px-2 text-white/50">Or continue with</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={!role}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </button>
              <button
                type="button"
                onClick={() => navigate("/auth/PhoneLogin")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5"
              >
                Use phone number
                <ArrowRight className="h-4 w-4" />
              </button>
              {popup && (
                <div
                  className={`rounded-2xl px-4 py-3 text-center text-sm ${
                    popup.toLowerCase().includes("successful") ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-200"
                  }`}
                >
                  {popup}
                </div>
              )}
            </form>
            <div className="mt-6 text-sm text-white/60">
              Already have an account?{" "}
              <button onClick={() => navigate("/auth/Login")} className="text-white hover:text-cyan-300">
                Sign in here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

