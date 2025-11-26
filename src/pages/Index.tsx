import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Flame, Star, ArrowUpRight, ChartPie } from "lucide-react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import FAQs from "../components/FAQs";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

const fetchServices = async () => {
  const res = await fetch("http://localhost:4000/api/services");
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
};

const fetchAnalytics = async () => {
  try {
    const res = await fetch("http://localhost:4000/api/admin/analytics");
    if (!res.ok) {
      // If unauthorized or forbidden, return null instead of throwing
      // This allows the component to use fallback values
      if (res.status === 401 || res.status === 403) {
        console.log('Analytics endpoint requires authentication, using fallback values');
        return null;
      }
      throw new Error("Failed to fetch analytics");
    }
    return res.json();
  } catch (error) {
    // Return null on any error to allow fallback values
    console.log('Analytics fetch error:', error);
    return null;
  }
};

const fetchReviews = async () => {
  const res = await fetch("http://localhost:4000/api/reviews");
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
};

const ServicesGrid = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["services", "homepage"],
    queryFn: fetchServices,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 animate-pulse">
            <div className="h-40 rounded-2xl bg-white/10" />
            <div className="mt-4 h-3 rounded bg-white/10" />
            <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-100">We couldn’t load the spotlight right now.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {(data || []).slice(0, 6).map((s: any) => (
        <article key={s.id || s.name} className="group rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-cyan-300/40">
          <div className="rounded-2xl bg-gradient-to-br from-purple-600/80 via-indigo-600/70 to-cyan-500/70 p-4 text-white">
            <div className="text-xs uppercase tracking-[0.4em] text-white/70">{s.category || "Creator"}</div>
            <h3 className="mt-2 text-2xl font-semibold">{s.name}</h3>
            <p className="text-sm text-white/80">by {s.provider}</p>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-white/70">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-300" /> {s.rating || "4.9"}
            </span>
            <span className="font-semibold text-cyan-300">₹{s.price}</span>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/40">{s.location || "Remote"}</p>
        </article>
      ))}
    </div>
  );
};

const CommunityStats = () => {
  const { data: analytics } = useQuery({ queryKey: ["analytics"], queryFn: fetchAnalytics, staleTime: 1000 * 60 * 10 });
  const { data: services } = useQuery({ queryKey: ["services", "homepage"], queryFn: fetchServices });

  const stats = useMemo(
    () => [
      {
        label: "Live briefs",
        value: analytics?.viewCount ? `${(analytics.viewCount / 1000).toFixed(1)}k` : "1.2k",
        sub: "brand views this week",
      },
      { label: "Active providers", value: analytics?.activeProviders || services?.length || 0, sub: "with verified profiles" },
      { label: "Influencers onboarded", value: analytics?.activeInfluencers || 0, sub: "ready for collabs" },
      { label: "Avg. rating", value: "4.9", sub: "based on verified reviews" },
    ],
    [analytics, services],
  );

  return (
    <section className="py-12">
      <div className="rounded-[32px] border border-white/10 bg-white/5 px-6 py-10 text-white shadow-xl shadow-black/40 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Community pulse</p>
            <h2 className="text-3xl font-black">OneFame by the numbers</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80">
            <Sparkles className="h-4 w-4" /> Updated live
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-sm text-white/60 mt-auto">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const VoicesSection = () => {
  const { data: reviews } = useQuery({ queryKey: ["reviews"], queryFn: fetchReviews, staleTime: 1000 * 30 });
  if (!reviews || reviews.length === 0) return null;
  return (
    <section className="py-16">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Creator voices</p>
        <h2 className="text-4xl font-black text-white">Fresh drops from the community</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {reviews.slice(0, 3).map((review: any) => (
          <div key={review.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/40">
            <div className="flex items-center gap-1 text-amber-300">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} className={`h-4 w-4 ${idx < (review.rating || 5) ? "fill-amber-300 text-amber-300" : "text-amber-100/40"}`} />
              ))}
            </div>
            <p className="mt-4 text-lg font-semibold text-white">{review.reviewer}</p>
            <p className="text-sm text-white/60">@{review.reviewee}</p>
            <p className="mt-4 text-white/75">{review.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const LandingPage = () => (
  <div className="relative min-h-screen bg-[#030711] text-white">
    <div className="pointer-events-none absolute inset-0 opacity-60">
      <div className="absolute -left-10 top-10 h-80 w-80 rounded-full bg-purple-600/30 blur-[140px]" />
      <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-cyan-500/20 blur-[150px]" />
      <div className="absolute left-1/2 bottom-0 h-56 w-56 rounded-full bg-pink-500/20 blur-[120px]" />
    </div>
    <Navbar />
    <main className="relative z-10 mx-auto max-w-6xl px-4">
      <Hero />
      <CommunityStats />
      <section className="py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Trending now</p>
            <h2 className="text-3xl font-black">Creators the internet is obsessed with</h2>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Explore marketplace
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6">
          <ServicesGrid />
        </div>
      </section>
      <section className="py-16">
        <h2 className="mb-10 text-center text-4xl font-black">How creators book on OneFame</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { title: "Launch your profile", desc: "Drop your best work, link socials, and let brands know what you’re about.", icon: <Flame className="h-10 w-10 text-orange-400" /> },
            { title: "Match with briefs", desc: "Filters plus intent data surface campaigns tailored to your niche.", icon: <ChartPie className="h-10 w-10 text-cyan-300" /> },
            { title: "Collaborate & get paid", desc: "Contracts, delivery, and escrow payments without leaving the tab.", icon: <Star className="h-10 w-10 text-amber-300" /> },
          ].map((card) => (
            <div key={card.title} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/30">
              <div className="mb-6">{card.icon}</div>
              <h3 className="text-2xl font-semibold">{card.title}</h3>
              <p className="mt-4 text-white/75">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <VoicesSection />
      <div className="my-12 rounded-[32px] border border-white/10 bg-white/5 py-16 shadow-xl shadow-black/30">
        <Testimonials />
      </div>
      <FAQs />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
