import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FAQs from '../components/FAQs';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4">
      <Hero />
      <section className="py-16">
        <h2 className="text-4xl font-extrabold text-pink-700 mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4"><rect x="4" y="4" width="16" height="16" rx="8" fill="#f472b6"/><path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            <h3 className="font-bold text-xl text-pink-600 mb-2">Sign Up</h3>
            <p className="text-gray-700 text-center">Create your account as an influencer or service provider.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4"><circle cx="12" cy="12" r="10" fill="#f472b6"/><path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h3 className="font-bold text-xl text-pink-600 mb-2">Book & Connect</h3>
            <p className="text-gray-700 text-center">Search, book, and chat with top service providers instantly.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4"><rect x="4" y="4" width="16" height="16" rx="8" fill="#f472b6"/><path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            <h3 className="font-bold text-xl text-pink-600 mb-2">Pay & Review</h3>
            <p className="text-gray-700 text-center">Secure payments and honest reviews for every booking.</p>
          </div>
        </div>
      </section>
      <section className="py-16">
        <h2 className="text-4xl font-extrabold text-pink-700 mb-8 text-center">Our Approach</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center">
            <h3 className="font-bold text-xl text-pink-600 mb-2">Community First</h3>
            <p className="text-gray-700">We empower creators and providers to build lasting relationships and grow together.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center">
            <h3 className="font-bold text-xl text-pink-600 mb-2">Trust & Transparency</h3>
            <p className="text-gray-700">Verified profiles, secure payments, and transparent reviews ensure a safe experience for all.</p>
          </div>
        </div>
      </section>
      <div className="bg-white rounded-2xl shadow-lg py-16 my-12">
        <Features />
      </div>
      <div className="bg-pink-100 py-16 my-12 rounded-2xl shadow-lg">
        <Testimonials />
      </div>
      <FAQs />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
