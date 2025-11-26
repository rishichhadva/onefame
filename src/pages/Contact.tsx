import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageSquare, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");
    // In a real app, this would send to your backend
    setTimeout(() => {
      setStatus("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-16">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6">Get in Touch</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to our team anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-xl bg-purple-500/20 p-3">
                  <Mail className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-sm text-white/60">support@onefame.com</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-xl bg-cyan-500/20 p-3">
                  <MessageSquare className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Live Chat</h3>
                  <p className="text-sm text-white/60">Available 24/7</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-xl bg-pink-500/20 p-3">
                  <MapPin className="h-6 w-6 text-pink-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Office</h3>
                  <p className="text-sm text-white/60">Mumbai, India</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none"
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Send Message
              </button>
              {status && (
                <p className={`text-center text-sm ${
                  status.includes("sent") ? "text-emerald-300" : "text-cyan-300"
                }`}>
                  {status}
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

