import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle, Search, BookOpen, MessageSquare, Mail, FileText, Video, ArrowRight } from "lucide-react";

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Getting Started",
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-purple-500/20 to-purple-400/20",
      iconColor: "text-purple-300",
      articles: [
        "How to create your profile",
        "Setting up your first service",
        "Understanding the booking process",
        "Payment setup guide"
      ]
    },
    {
      title: "Account & Profile",
      icon: <HelpCircle className="h-6 w-6" />,
      color: "from-cyan-500/20 to-cyan-400/20",
      iconColor: "text-cyan-300",
      articles: [
        "Editing your profile",
        "Changing your role",
        "Username and verification",
        "Privacy settings"
      ]
    },
    {
      title: "Bookings & Payments",
      icon: <FileText className="h-6 w-6" />,
      color: "from-green-500/20 to-green-400/20",
      iconColor: "text-green-300",
      articles: [
        "How to book a service",
        "Payment methods",
        "Refund policy",
        "Dispute resolution"
      ]
    },
    {
      title: "Chat & Communication",
      icon: <MessageSquare className="h-6 w-6" />,
      color: "from-pink-500/20 to-pink-400/20",
      iconColor: "text-pink-300",
      articles: [
        "Using the chat feature",
        "Price negotiation",
        "Scheduling meetings",
        "Requesting quotes"
      ]
    }
  ];

  const quickLinks = [
    { title: "Contact Support", href: "/contact", icon: <Mail className="h-5 w-5" /> },
    { title: "Help Center", href: "/help", icon: <Video className="h-5 w-5" /> },
    { title: "Terms of Service", href: "/terms", icon: <FileText className="h-5 w-5" /> },
    { title: "Privacy Policy", href: "/privacy", icon: <HelpCircle className="h-5 w-5" /> },
  ];

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6">Help Center</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Find answers to common questions and get the support you need
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 backdrop-blur">
              <Search className="h-5 w-5 text-white/50 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles..."
                className="flex-1 h-14 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {quickLinks.map((link, idx) => (
            <Link
              key={idx}
              to={link.href}
              className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-cyan-400/40 hover:bg-white/10"
            >
              <div className="rounded-lg bg-purple-500/20 p-3">
                {link.icon}
              </div>
              <span className="text-sm font-semibold text-center">{link.title}</span>
            </Link>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-6 mb-16">
          {categories.map((category, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="flex items-center gap-4 mb-6">
                <div className={`rounded-xl bg-gradient-to-br ${category.color} p-3`}>
                  <div className={category.iconColor}>
                    {category.icon}
                  </div>
                </div>
                <h2 className="text-2xl font-bold">{category.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {category.articles.map((article, articleIdx) => (
                  <div
                    key={articleIdx}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/40 hover:bg-white/10 group cursor-pointer"
                  >
                    <span className="text-white/80 group-hover:text-white">{article}</span>
                    <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-cyan-300 transition" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support CTA */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-cyan-500/20 to-blue-500/20 p-10 text-center">
          <h3 className="text-2xl font-bold mb-3">Still need help?</h3>
          <p className="text-white/70 mb-6">
            Our support team is available 24/7 to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-purple-900/30 transition hover:-translate-y-1"
            >
              <MessageSquare className="h-5 w-5" />
              Contact Support
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition"
            >
              <Mail className="h-5 w-5" />
              Send Email
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;

