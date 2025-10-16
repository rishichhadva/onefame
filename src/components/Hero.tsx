import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch('http://localhost:4000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setProfile(data.user || data);
      }
    };
    fetchProfile();
  }, []);

  // Profile completeness check using backend data - ALL fields must be filled
  const isProfileComplete = profile && profile.bio && profile.interests && profile.skills && profile.location && profile.experience && 
    (user?.role === 'influencer' ? profile.socials : profile.services) && 
    profile.bio.trim() !== '' && profile.interests.trim() !== '' && profile.skills.trim() !== '' && 
    profile.location.trim() !== '' && profile.experience.trim() !== '' && 
    (user?.role === 'influencer' ? (profile.socials && profile.socials.trim() !== '') : (profile.services && profile.services.trim() !== ''));

  // Hero text logic
  let heroTitle = 'Connect. Collaborate. Create.';
  let heroDesc = 'The platform for influencers & providers to work together seamlessly.';
  let buttonText = 'Get Started';

  if (user) {
    heroTitle = 'Ready to conquer world!';
    heroDesc = user.role === 'provider'
      ? 'Share your offerings and start connecting with clients.'
      : 'Browse and book top providers instantly.';
    buttonText = user.role === 'provider' ? 'Share Offerings' : 'Find Providers';
  }

  const handleGetStarted = () => {
    if (!user) {
      navigate('/auth/Signup');
    } else if (!isProfileComplete) {
      if (user.role === 'provider') {
        navigate('/provider/dashboard');
      } else if (user.role === 'influencer') {
        navigate('/influencer/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      if (user.role === 'provider') {
        navigate('/provider/dashboard');
      } else if (user.role === 'influencer') {
        navigate('/influencer/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <section className="relative py-32 text-center mx-4 mb-12 overflow-hidden">
      {/* Background with gradient and patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-500 to-indigo-600 rounded-3xl"></div>
      <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
      <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        <div className="mb-8">
          <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium text-lg mb-6 border border-white/30">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Welcome to OneFame
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 tracking-tight leading-tight">
          <span className="block">{heroTitle}</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          {heroDesc}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button 
            onClick={handleGetStarted} 
            className="group px-10 py-5 bg-white text-blue-600 rounded-2xl text-xl font-bold shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 hover:scale-105 active:scale-95"
          >
            <span className="flex items-center">
              {buttonText}
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          
          {!user && (
            <button 
              onClick={() => navigate('/search')} 
              className="px-8 py-4 border-2 border-white/50 text-white rounded-2xl text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white"
            >
              Browse Providers
            </button>
          )}
        </div>
        
        {user && profile && !isProfileComplete && (
          <div className="mt-10 p-6 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
            <div className="flex items-center justify-center text-white">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                Complete your profile setup{' '}
                <a 
                  href="#" 
                  onClick={() => navigate(user.role === 'provider' ? '/auth/CompleteProfileProvider' : '/auth/CompleteProfileInfluencer')} 
                  className="underline font-bold hover:text-yellow-200 transition-colors"
                >
                  here
                </a>
              </span>
            </div>
          </div>
        )}
        
        {/* Stats or additional info */}
        {!user && (
          <div className="mt-16 grid grid-cols-3 gap-8 text-white/80">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-sm font-medium">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm font-medium">Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">2500+</div>
              <div className="text-sm font-medium">Collaborations</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
