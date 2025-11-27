import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Image, DollarSign, Star, CalendarDays, Upload, X, Trash2 } from 'lucide-react';
import { apiUrl } from '@/lib/api';

const ProviderProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
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
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        const token = localStorage.getItem('token');
        const res = await fetch(apiUrl("/api/profile/portfolio"), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64Image })
        });

        if (res.ok) {
          const data = await res.json();
          setProfile({ ...profile, portfolio_images: data.portfolio_images });
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to upload image');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
      setUploading(false);
    }
  };

  const handleDeleteImage = async (index: number) => {
    if (!confirm('Delete this image?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(apiUrl(`/api/profile/portfolio/${index}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({ ...profile, portfolio_images: data.portfolio_images });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete image');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete image');
    }
  };

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

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl shadow-2xl shadow-black/40 p-8">
          <div className="flex justify-start mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-all border border-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-8 text-white">Provider Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-500/20 p-2">
                    <Image className="h-5 w-5 text-purple-300" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Portfolio</h2>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <p className="text-white/60 mb-4">Images/Videos showcase (Max 20 images)</p>
              {profile?.portfolio_images && profile.portfolio_images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {profile.portfolio_images.map((img: string, index: number) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleDeleteImage(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition"
                  >
                    <Upload className="h-8 w-8 text-white/30 mb-2" />
                    <p className="text-sm text-white/50">Add Image</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-lg shadow-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-cyan-500/20 p-2">
                  <DollarSign className="h-5 w-5 text-cyan-300" />
                </div>
                <h2 className="text-xl font-bold text-white">Pricing & Availability</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Starting Price</label>
                  <p className="text-lg font-bold text-cyan-300">₹{profile?.price || '1000'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Availability</label>
                  <p className="text-white/80">Available for bookings</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Response Time</label>
                  <p className="text-white/80">Within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-lg shadow-black/20 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-amber-500/20 p-2">
                  <Star className="h-5 w-5 text-amber-300" />
                </div>
                <h2 className="text-xl font-bold text-white">Reviews & Ratings</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-white">4.9</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-300 text-amber-300" />
                    ))}
                  </div>
                  <div className="text-white/60">Based on 127 reviews</div>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Sarah Chen', rating: 5, comment: 'Amazing work! Professional and creative.' },
                    { name: 'Marcus Rivera', rating: 5, comment: 'Best photographer I\'ve worked with.' },
                    { name: 'Emma Wilson', rating: 4, comment: 'Great experience overall.' },
                  ].map((review, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{review.name}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((j) => (
                            <Star
                              key={j}
                              className={`h-4 w-4 ${j <= review.rating ? 'fill-amber-300 text-amber-300' : 'text-white/20'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-white/70">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
