import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InfluencerNavbar from '../../components/InfluencerNavbar';
import { ArrowLeft, Heart, CalendarDays, Star, CheckCircle2, Upload, UserCircle, Edit, Save } from 'lucide-react';
import { apiUrl } from '@/lib/api';

const InfluencerProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [socials, setSocials] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [popup, setPopup] = useState('');
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

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
          const profileData = data.user || data;
          setProfile(profileData);
          setName(profileData.name || '');
          setEmail(profileData.email || '');
          setBio(profileData.bio || '');
          setInterests(profileData.interests || '');
          setSkills(profileData.skills || '');
          setLocation(profileData.location || '');
          setExperience(profileData.experience || '');
          setSocials(profileData.socials || '');
          setProfilePhoto(profileData.profile_photo || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Helper function to compress image
  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.9): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const result = e.target?.result;
            if (!result || typeof result !== 'string') {
              reject(new Error('Failed to read file'));
              return;
            }
            const img = new window.Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > height) {
                  if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                  }
                } else {
                  if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                  }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  reject(new Error('Could not get canvas context'));
                  return;
                }
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
              } catch (error: any) {
                reject(new Error(`Compression failed: ${error.message}`));
              }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = result;
          } catch (error: any) {
            reject(new Error(`File processing error: ${error.message}`));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      } catch (error: any) {
        reject(new Error(`Compression setup failed: ${error.message}`));
      }
    });
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPopup('Please select an image file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setPopup('Image size must be less than 20MB');
      return;
    }

    setUploadingProfilePhoto(true);
    setPopup('Compressing image...');
    
    try {
      const compressedBase64 = await compressImage(file, 800, 800, 0.9);
      if (!compressedBase64 || compressedBase64.length === 0) {
        throw new Error('Compression failed - empty result');
      }
      setProfilePhoto(compressedBase64);
      setPopup('Profile photo updated! Click Save Changes to save.');
    } catch (err: any) {
      console.error('Profile photo compression error:', err);
      setPopup(err.message || 'Failed to process image. Please try again.');
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPopup('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPopup('Please log in to update your profile');
        return;
      }

      const body: any = {
        name,
        email,
        bio,
        interests,
        skills,
        location,
        experience,
        socials
      };

      if (profilePhoto) {
        body.profile_photo = profilePhoto;
      }

      const res = await fetch(apiUrl("/api/profile"), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Profile update failed');
      }

      // Refresh profile
      const profileRes = await fetch(apiUrl("/api/profile"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const userData = profileData.user || profileData;
        setProfile(userData);
        if (userData.profile_photo) {
          setUser({ ...user, profile_photo: userData.profile_photo });
        }
      }

      setPopup('Profile updated successfully!');
      setTimeout(() => setPopup(''), 2000);
      setEditing(false);
    } catch (err: any) {
      console.error('Profile save error:', err);
      setPopup(err.message || 'Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030711] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <InfluencerNavbar />
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-pink-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-purple-500/20 blur-[120px]" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl shadow-2xl shadow-black/40 p-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-all border border-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-400 text-white rounded-full font-semibold transition-all shadow-lg shadow-pink-900/40 hover:scale-105"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-8 text-white">Influencer Profile</h1>

          {/* Profile Photo Section */}
          <div className="mb-8 pb-8 border-b border-white/10">
            <label className="block text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-pink-300" />
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-400 flex items-center justify-center text-white text-4xl font-bold border-2 border-white/20">
                    {(profile?.name || user?.name || 'I').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {editing && (
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    disabled={uploadingProfilePhoto}
                    className="px-4 py-2 bg-pink-500/20 text-pink-300 rounded-lg hover:bg-pink-500/30 transition disabled:opacity-50 text-sm font-medium"
                  >
                    <Upload className="h-4 w-4 inline mr-2" />
                    {uploadingProfilePhoto ? 'Uploading...' : profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  <input
                    ref={profilePhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-white/50 mt-2">JPG, PNG or GIF. Max 20MB (will be compressed)</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Edit Form */}
          {editing ? (
            <form onSubmit={handleProfileSave} className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Name"
                  className="px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder:text-white/40"
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder:text-white/40"
                />
              </div>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Bio - Tell us about yourself"
                rows={3}
                className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder:text-white/40"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={interests}
                  onChange={e => setInterests(e.target.value)}
                  placeholder="Interests"
                  className="px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder:text-white/40"
                />
                <input
                  type="text"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="Skills"
                  className="px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder:text-white/40"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Location"
                  className="px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder:text-white/40"
                />
                <input
                  type="text"
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder="Experience"
                  className="px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder:text-white/40"
                />
              </div>
              <input
                type="text"
                value={socials}
                onChange={e => setSocials(e.target.value)}
                placeholder="Socials (comma separated URLs)"
                className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder:text-white/40"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-400 text-white rounded-xl font-bold shadow-lg shadow-pink-900/40 transition hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    // Reset form to original values
                    setName(profile?.name || '');
                    setEmail(profile?.email || '');
                    setBio(profile?.bio || '');
                    setInterests(profile?.interests || '');
                    setSkills(profile?.skills || '');
                    setLocation(profile?.location || '');
                    setExperience(profile?.experience || '');
                    setSocials(profile?.socials || '');
                    setProfilePhoto(profile?.profile_photo || '');
                    setPopup('');
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition"
                >
                  Cancel
                </button>
              </div>
              {popup && (
                <div className={`px-4 py-3 rounded-xl text-center ${
                  popup.includes('successfully')
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {popup}
                </div>
              )}
            </form>
          ) : (
            <div className="mb-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Name</label>
                <p className="text-white">{profile?.name || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Email</label>
                <p className="text-white">{profile?.email || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Bio</label>
                <p className="text-white">{profile?.bio || 'Not set'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Interests</label>
                  <p className="text-white">{profile?.interests || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Skills</label>
                  <p className="text-white">{profile?.skills || 'Not set'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Location</label>
                  <p className="text-white">{profile?.location || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Experience</label>
                  <p className="text-white">{profile?.experience || 'Not set'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Socials</label>
                <p className="text-white">{profile?.socials || 'Not set'}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-lg shadow-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-pink-500/20 p-2">
                  <Heart className="h-5 w-5 text-pink-300" />
                </div>
                <h2 className="text-xl font-bold text-white">Preferences</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Preferred Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {['Fashion', 'Lifestyle', 'Beauty'].map((cat) => (
                      <span key={cat} className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-sm border border-pink-500/30">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Budget Range</label>
                  <p className="text-white/80">₹5,000 - ₹50,000</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Content Types</label>
                  <p className="text-white/80">Reels, Posts, Stories</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-lg shadow-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-purple-500/20 p-2">
                  <CalendarDays className="h-5 w-5 text-purple-300" />
                </div>
                <h2 className="text-xl font-bold text-white">Past Bookings</h2>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Brand Collab with XYZ', date: '2025-09-15', status: 'Completed' },
                  { name: 'Instagram Shoutout', date: '2025-08-20', status: 'Completed' },
                  { name: 'Product Review', date: '2025-07-10', status: 'Completed' },
                ].map((booking, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{booking.name}</span>
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-sm text-white/60">{booking.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-lg shadow-black/20 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-amber-500/20 p-2">
                  <Star className="h-5 w-5 text-amber-300" />
                </div>
                <h2 className="text-xl font-bold text-white">Reviews Given</h2>
              </div>
              <div className="space-y-3">
                {[
                  { provider: 'Mike Johnson Photography', rating: 5, comment: 'Excellent service and quality work!' },
                  { provider: 'Sarah\'s Studio', rating: 5, comment: 'Very professional and easy to work with.' },
                  { provider: 'Creative Agency', rating: 4, comment: 'Good experience, would recommend.' },
                ].map((review, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{review.provider}</span>
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
  );
};

export default InfluencerProfile;
