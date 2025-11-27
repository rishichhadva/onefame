import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MessageSquare,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Star,
  Bell,
  DollarSign,
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Eye,
  Zap,
  BarChart3,
  Activity,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { API_BASE } from '@/lib/api';

const fetchWithAuth = async (path: string, token: string | null) => {
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
};

const fetcher = async (path: string) => {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  });

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/auth/Login");
    }
  }, [token, navigate]);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchWithAuth("/api/profile", token),
    enabled: Boolean(token),
  });

  const bookingsQuery = useQuery({
    queryKey: ["bookings", token],
    queryFn: () => fetchWithAuth("/api/bookings", token),
    enabled: Boolean(token),
  });

  const servicesQuery = useQuery({
    queryKey: ["services-mini"],
    queryFn: () => fetcher("/api/services"),
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications", token],
    queryFn: () => fetchWithAuth("/api/notifications", token),
    enabled: Boolean(token),
  });

  const profile = profileQuery.data?.user || profileQuery.data;
  const bookings = bookingsQuery.data || [];
  const services = servicesQuery.data || [];
  const notifications = notificationsQuery.data || [];

  const completion = useMemo(() => {
    if (!profile) return 0;
    const fields = ["name", "username", "bio", "interests", "skills", "location", "experience", "services", "socials"];
    const filled = fields.filter((field) => profile[field]?.trim());
    return Math.round((filled.length / fields.length) * 100);
  }, [profile]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b: any) => (b.date ? new Date(b.date) : now) >= now)
      .slice(0, 5);
  }, [bookings]);

  const completed = useMemo(() => {
    const now = new Date();
    return bookings.filter((b: any) => {
      if (!b.date) return false;
      return new Date(b.date) < now;
    }).length;
  }, [bookings]);

  const spotlight = useMemo(() => services.slice(0, 6), [services]);

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030711] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Calculate unread notifications
  const unreadNotifications = notifications.filter((n: any) => !n.read).length;
  
  const stats = [
    {
      label: "Profile Completion",
      value: `${completion}%`,
      change: completion >= 90 ? "Complete!" : `${100 - completion}% to go`,
      icon: Activity,
      color: "from-cyan-500 to-blue-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Active Bookings",
      value: activeBookings,
      change: `${totalBookings} total`,
      icon: CalendarDays,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Completed",
      value: completed,
      change: "All time",
      icon: CheckCircle2,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Notifications",
      value: unreadNotifications > 0 ? `${unreadNotifications} new` : notifications.length,
      change: `${notifications.length} total`,
      icon: Bell,
      color: "from-orange-500 to-amber-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute left-1/2 bottom-0 h-64 w-64 rounded-full bg-pink-500/15 blur-[100px]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black">Welcome back, {profile.name?.split(" ")[0] || "Creator"}</h1>
            <p className="mt-2 text-white/60">Here's what's happening with your account today</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/chat")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:scale-105"
            >
              <Zap className="h-4 w-4" />
              Discover
            </button>
            <button
              onClick={() => navigate("/auth/CompleteProfile")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
            >
              <Briefcase className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/20 hover:shadow-xl hover:shadow-black/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                      <Icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: "currentColor" }} />
                    </div>
                    <span className="text-xs font-medium text-white/50">{stat.change}</span>
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Bookings */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-500/20 p-2">
                    <CalendarDays className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Upcoming Bookings</h2>
                    <p className="text-sm text-white/50">Your next scheduled sessions</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/booking")}
                  className="text-sm font-medium text-cyan-300 hover:text-cyan-200 transition"
                >
                  View all
                </button>
              </div>
              {upcoming.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
                  <CalendarDays className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 mb-2">No upcoming bookings</p>
                  <p className="text-sm text-white/40">Start exploring creators to book your first session</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((booking: any, idx: number) => (
                    <div
                      key={booking.id || idx}
                      className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/40 hover:bg-white/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">{booking.service || "Service"}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === "confirmed" ? "bg-green-500/20 text-green-300" :
                              booking.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                              "bg-white/10 text-white/70"
                            }`}>
                              {booking.status || "pending"}
                            </span>
                          </div>
                          <p className="text-sm text-white/60 mb-3">{booking.provider || "Provider"}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {booking.date ? new Date(booking.date).toLocaleDateString() : "TBD"}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {booking.time || "Flexible"}
                            </div>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-white/10">
                          <ArrowRight className="h-4 w-4 text-white/60" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Creators */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/20 p-2">
                    <Sparkles className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Featured Creators</h2>
                    <p className="text-sm text-white/50">Top performers in your network</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/chat")}
                  className="text-sm font-medium text-cyan-300 hover:text-cyan-200 transition"
                >
                  Explore all
                </button>
              </div>
              {spotlight.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
                  <Users className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">No creators available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {spotlight.map((service: any) => (
                    <div
                      key={service.id || service.name}
                      className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 transition hover:border-cyan-300/40 hover:shadow-lg hover:shadow-cyan-900/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{service.name}</h3>
                          <p className="text-xs text-white/50">{service.provider}</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-300">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="text-xs font-medium">{service.rating || "4.9"}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <MapPin className="h-3.5 w-3.5" />
                          {service.location || "Remote"}
                        </div>
                        <div className="text-sm font-bold text-cyan-300">₹{service.price}</div>
                      </div>
                      <button
                        onClick={() => navigate("/booking", { state: { provider: service.provider } })}
                        className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
                      >
                        Book now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 p-2.5">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Profile Status</h3>
                    <p className="text-xs text-white/50 capitalize">{profile.role || "Creator"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin className="h-4 w-4 text-cyan-300" />
                  <span>{profile.location || "Location not set"}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Sparkles className="h-4 w-4 text-purple-300" />
                  <span>{profile.skills || "Skills not added"}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <TrendingUp className="h-4 w-4 text-pink-300" />
                  <span>{profile.interests || "Interests not set"}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Profile Completion</span>
                  <span className="text-xs font-bold text-white">{completion}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-orange-500/20 p-2">
                  <Bell className="h-5 w-5 text-orange-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Recent Activity</h3>
                  <p className="text-xs text-white/50">Latest updates</p>
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/20 p-6 text-center">
                  <Bell className="h-8 w-8 text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/50">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((note: any, idx: number) => (
                    <div 
                      key={note.id || idx} 
                      className={`rounded-lg border p-3 transition cursor-pointer ${
                        note.read 
                          ? 'border-white/10 bg-white/5' 
                          : 'border-cyan-400/40 bg-cyan-500/10'
                      }`}
                      onClick={() => {
                        // Mark as read if clicked
                        if (!note.read && token) {
                          fetch(`${API_BASE}/api/notifications/${note.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ read: true }),
                          }).then(() => {
                            notificationsQuery.refetch();
                          });
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs text-white/50">
                          {note.createdat 
                            ? new Date(note.createdat).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })
                            : 'Recently'}
                        </p>
                        {!note.read && (
                          <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                        )}
                      </div>
                      <p className="text-sm text-white/80">{note.message || note.content || "New update"}</p>
                      {note.type && (
                        <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                          {note.type}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-green-500/20 p-2">
                  <Zap className="h-5 w-5 text-green-300" />
                </div>
                <h3 className="font-bold text-white">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/chat")}
                  className="w-full flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm font-medium text-white/80 transition hover:bg-white/10 hover:border-cyan-300/40"
                >
                  <Eye className="h-4 w-4 text-cyan-300" />
                  Browse Marketplace
                </button>
                <button
                  onClick={() => navigate("/auth/CompleteProfile")}
                  className="w-full flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm font-medium text-white/80 transition hover:bg-white/10 hover:border-purple-300/40"
                >
                  <Briefcase className="h-4 w-4 text-purple-300" />
                  Update Profile
                </button>
                <button
                  onClick={() => navigate("/chat/index")}
                  className="w-full flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm font-medium text-white/80 transition hover:bg-white/10 hover:border-pink-300/40"
                >
                  <MessageSquare className="h-4 w-4 text-pink-300" />
                  Open Messages
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
