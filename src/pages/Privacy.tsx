import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, Database, UserCheck } from "lucide-react";

const Privacy = () => {
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
            <Shield className="h-4 w-4" />
            privacy policy
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6">Privacy Policy</h1>
          <p className="text-white/60">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-purple-300" />
              <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            </div>
            <p className="text-white/70 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Account information (name, email, phone number)</li>
              <li>Profile information (bio, skills, portfolio, social media links)</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Communication data (messages, reviews, feedback)</li>
              <li>Usage data (how you interact with our platform)</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
            </div>
            <p className="text-white/70 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-pink-300" />
              <h2 className="text-2xl font-bold">3. Information Sharing</h2>
            </div>
            <p className="text-white/70 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>With other users as necessary to facilitate bookings and collaborations</li>
              <li>With service providers who assist in operating our platform</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-6 w-6 text-amber-300" />
              <h2 className="text-2xl font-bold">4. Your Rights</h2>
            </div>
            <p className="text-white/70 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Object to certain processing of your information</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="text-white/70 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4">6. Cookies & Tracking</h2>
            <p className="text-white/70 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
            <p className="text-white/70 leading-relaxed">
              Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.
            </p>
          </section>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/20 to-cyan-500/20 p-8 text-center">
            <p className="text-white/70 mb-4">
              Have questions about your privacy?
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

export default Privacy;

