import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Shield, AlertCircle, CheckCircle2 } from "lucide-react";

const Terms = () => {
  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-white/50 mb-4">
            <FileText className="h-4 w-4" />
            legal
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6">Terms of Service</h1>
          <p className="text-white/60">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-purple-300" />
              <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
            </div>
            <p className="text-white/70 leading-relaxed">
              By accessing and using OneFame, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-bold">2. User Accounts</h2>
            </div>
            <p className="text-white/70 leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account and password. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Keep your account information updated</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-amber-300" />
              <h2 className="text-2xl font-bold">3. Service Usage</h2>
            </div>
            <p className="text-white/70 leading-relaxed mb-4">
              You agree not to use the service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful or malicious code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Engage in fraudulent or deceptive practices</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4">4. Payments & Refunds</h2>
            <p className="text-white/70 leading-relaxed">
              All payments are processed securely through our payment partners. Refund policies vary by service type and are clearly stated at the time of booking. OneFame reserves the right to modify pricing and payment terms with prior notice.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
            <p className="text-white/70 leading-relaxed">
              All content on OneFame, including text, graphics, logos, and software, is the property of OneFame or its content suppliers. Users retain ownership of content they create but grant OneFame a license to use, display, and distribute such content on the platform.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
            <p className="text-white/70 leading-relaxed">
              OneFame shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the service. Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4">7. Changes to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notifications.
            </p>
          </section>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/20 to-cyan-500/20 p-8 text-center">
            <p className="text-white/70 mb-4">
              Questions about our Terms of Service?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
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

export default Terms;

