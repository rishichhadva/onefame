import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles, Users, Target, Zap, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-16">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-white/50 mb-4">
            <Sparkles className="h-4 w-4" />
            our story
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6">About OneFame</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Connecting creators and providers in a seamless marketplace built for the modern creator economy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="rounded-xl bg-purple-500/20 p-4 w-fit mb-4">
              <Target className="h-8 w-8 text-purple-300" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-white/70">
              To empower creators and service providers by creating a transparent, efficient marketplace where talent meets opportunity. We believe every creator deserves fair compensation and every brand deserves authentic partnerships.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="rounded-xl bg-cyan-500/20 p-4 w-fit mb-4">
              <Zap className="h-8 w-8 text-cyan-300" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Our Vision</h2>
            <p className="text-white/70">
              To become the leading platform for creator-brand collaborations, where innovative tools, secure payments, and genuine connections drive the future of the creator economy.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Why OneFame?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-6 w-fit mx-auto mb-4">
                <Users className="h-10 w-10 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Network</h3>
              <p className="text-white/60 text-sm">
                Verified creators and providers ensure quality collaborations every time.
              </p>
            </div>
            <div className="text-center">
              <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-6 w-fit mx-auto mb-4">
                <Zap className="h-10 w-10 text-cyan-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-white/60 text-sm">
                Built-in escrow and automated payments protect both creators and brands.
              </p>
            </div>
            <div className="text-center">
              <div className="rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-6 w-fit mx-auto mb-4">
                <Heart className="h-10 w-10 text-pink-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Creator-First</h3>
              <p className="text-white/60 text-sm">
                Designed by creators, for creators. Your success is our priority.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-cyan-500/20 to-blue-500/20 p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Revolution</h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Whether you're a creator looking to monetize your talent or a brand seeking authentic partnerships, OneFame is your gateway to success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-8 py-3 text-lg font-semibold text-white hover:bg-white/10 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;

