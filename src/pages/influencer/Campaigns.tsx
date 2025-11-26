import React from 'react';
import { useNavigate } from 'react-router-dom';
import InfluencerNavbar from '../../components/InfluencerNavbar';
import { ArrowLeft, Target, Sparkles } from 'lucide-react';

const Campaigns = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <InfluencerNavbar />
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-pink-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <div className="flex justify-start mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl shadow-2xl shadow-black/40 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-pink-500/20 p-6 border border-pink-400/30">
              <Target className="h-16 w-16 text-pink-300" />
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-white mb-4">Campaigns Coming Soon!</h1>
          
          <div className="flex justify-center mb-6">
            <Sparkles className="h-8 w-8 text-pink-300 animate-pulse" />
          </div>
          
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            We are still working on getting brand campaigns to you, stay tuned!
          </p>
          
          <p className="text-white/60 mb-8">
            Our team is building an amazing platform to connect you with top brands and exciting collaboration opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/influencer/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-400 text-white rounded-full font-semibold shadow-lg shadow-pink-900/40 transition hover:scale-105"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/booking')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold border border-white/20 transition"
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;

