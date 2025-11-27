import React, { useState, useEffect } from 'react';
import { apiUrl } from "@/lib/api";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, LogOut, Settings } from 'lucide-react';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(apiUrl("/api/profile"), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user || data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const { data: services = [] } = useQuery({
    queryKey: ['user-services', profile?.name],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/services"));
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      return data.filter((s: any) => 
        s.provider?.toLowerCase() === profile?.name?.toLowerCase() || 
        s.provider?.toLowerCase() === user?.name?.toLowerCase()
      ) || [];
    },
    enabled: !!profile,
  });

  const handleBack = () => navigate(-1);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030711] text-white">
        <div className="text-center text-cyan-300 font-bold text-xl">Please log in to view your profile.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030711] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const firstName = displayName.split(' ')[0];

  const defaultOfferings = [
    { name: 'Sample Photographer', price: 1000 },
    { name: 'Sample Influencer', price: 2000 },
    { name: 'Sample Fitness Coach', price: 1500 },
    { name: 'Sample Musician', price: 1200 },
  ];

  const offerings = services.length > 0 
    ? services.slice(0, 4).map((s: any) => ({ name: s.name, price: s.price }))
    : defaultOfferings;

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl shadow-2xl shadow-black/40 p-8">
          {/* Top Navigation */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-all border border-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-all border border-white/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Profile Header Section */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-white/10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-900/40 flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-1">{displayName}</h1>
              <p className="text-lg text-white/70">{displayEmail}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-lg shadow-purple-900/40'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-lg shadow-purple-900/40'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Settings
              </button>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Name</label>
                  <p className="text-base text-white font-medium">{profile?.name || displayName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Bio</label>
                  <p className="text-base text-white/80 font-medium">{profile?.bio || `Hey I'm ${firstName}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Skills</label>
                  <p className="text-base text-white/80 font-medium">{profile?.skills || 'Professional Photographer'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Experience</label>
                  <p className="text-base text-white/80 font-medium">{profile?.experience || '2 years'}</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
                  <p className="text-base text-white/80 font-medium">{displayEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Interests</label>
                  <p className="text-base text-white/80 font-medium">{profile?.interests || 'Photography'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Location</label>
                  <p className="text-base text-white/80 font-medium">{profile?.location || 'Mumbai'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Services</label>
                  <p className="text-base text-white/80 font-medium">{profile?.services || 'Photography, Video Editing'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* My Offerings Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">My Offerings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {offerings.map((offering: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 shadow-lg shadow-black/20 hover:border-cyan-300/40 transition"
                >
                  <h3 className="text-lg font-bold text-white mb-2">{offering.name}</h3>
                  <p className="text-base text-cyan-300 mb-4 font-semibold">Price: ₹{offering.price}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-green-400">Active</p>
                    <div className="h-1.5 bg-green-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
