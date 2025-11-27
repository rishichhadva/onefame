import React, { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("apiUrl("/api/")profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data.user || data);
    };
    fetchProfile();
  }, []);

  const isProfileComplete =
    profile &&
    profile.bio &&
    profile.interests &&
    profile.skills &&
    profile.location &&
    profile.experience &&
    (user?.role === "influencer" ? profile.socials : profile.services) &&
    profile.bio.trim() !== "" &&
    profile.interests.trim() !== "" &&
    profile.skills.trim() !== "" &&
    profile.location.trim() !== "" &&
    profile.experience.trim() !== "" &&
    (user?.role === "influencer"
      ? profile.socials && profile.socials.trim() !== ""
      : profile.services && profile.services.trim() !== "");

  const heroCopy = user
    ? {
        title: user.role === "provider" ? "Booked-out pipelines start here." : "Find collaborators who match your energy.",
        desc:
          user.role === "provider"
            ? "Showcase your services, respond to briefs, and get paid without leaving the dashboard."
            : "Search, message, and book trusted providers with transparent reviews and secure payouts.",
        cta: user.role === "provider" ? "Open provider hub" : "Browse marketplace",
      }
    : {
        title: "Connect. Collaborate. Cash in.",
        desc: "OneFame is the home for modern creators and service partners to team up, get organized, and get paid faster.",
        cta: "Get started",
      };

  const handlePrimary = () => {
    if (!user) {
      navigate("/auth/signup");
      return;
    }
    if (!isProfileComplete && profile) {
      if (user.role === "provider") {
        navigate("/auth/CompleteProfileProvider");
        return;
      }
      if (user.role === "influencer") {
        navigate("/auth/CompleteProfileInfluencer");
        return;
      }
    }
    if (user.role === "provider") navigate("/provider/dashboard");
    else if (user.role === "influencer") navigate("/dashboard");
    else navigate("/dashboard");
  };

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/5 px-6 py-20 shadow-2xl shadow-black/40">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -left-10 top-0 h-60 w-60 rounded-full bg-purple-600/30 blur-[120px]" />
        <div className="absolute right-10 top-10 h-52 w-52 rounded-full bg-cyan-500/30 blur-[120px]" />
      </div>
      <div className="relative z-10 grid gap-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/70">
            fresh drops • 2025
          </div>
          <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">{heroCopy.title}</h1>
          <p className="text-lg text-white/80">{heroCopy.desc}</p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handlePrimary}
              className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-400 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:scale-[1.02]"
            >
              {heroCopy.cta}
            </button>
            {!user && (
              <button
                onClick={() => navigate("/chat")}
                className="rounded-3xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Browse providers
              </button>
            )}
          </div>
          {!user && (
            <div className="grid grid-cols-3 gap-6 pt-6 text-white/70">
              <div>
                <p className="text-2xl font-bold">1.2K+</p>
                <p className="text-xs uppercase tracking-[0.3em]">Active creators</p>
              </div>
              <div>
                <p className="text-2xl font-bold">580+</p>
                <p className="text-xs uppercase tracking-[0.3em]">Providers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">3.4K</p>
                <p className="text-xs uppercase tracking-[0.3em]">Collabs shipped</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
