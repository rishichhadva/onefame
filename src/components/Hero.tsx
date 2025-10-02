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
  let heroDesc = 'The platform for influencers & service providers to work together seamlessly.';
  let buttonText = 'Get Started';

  if (user) {
    heroTitle = 'Ready to conquer world!';
    heroDesc = user.role === 'provider'
      ? 'Share your offerings and start connecting with clients.'
      : 'Browse and book top providers instantly.';
    buttonText = user.role === 'provider' ? 'Provide Services' : 'Search Services';
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
    <section className="bg-pink-50 py-24 text-center rounded-xl mx-4 mb-8 shadow-lg flex flex-col items-center justify-center">
      <h1 className="text-5xl md:text-7xl font-extrabold text-pink-700 mb-6 tracking-tight">{heroTitle}</h1>
      <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto">{heroDesc}</p>
      <button onClick={handleGetStarted} className="px-10 py-4 rounded-md bg-gradient-to-r from-pink-500 to-purple-400 text-white text-xl font-bold shadow-lg transition hover:from-pink-600 hover:to-purple-500">{buttonText}</button>
      {user && profile && !isProfileComplete && (
        <div className="mt-8">
          <span className="text-pink-700 font-semibold">Complete your profile setup from <a href="#" onClick={() => navigate(user.role === 'provider' ? '/auth/CompleteProfileProvider' : '/auth/CompleteProfileInfluencer')} className="underline text-purple-600">here</a></span>
        </div>
      )}
    </section>
  );
};

export default Hero;
