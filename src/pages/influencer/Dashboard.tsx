import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InfluencerNavbar from '../../components/InfluencerNavbar';
import { apiUrl } from '@/lib/api';
// Store native Image constructor before lucide-react import shadows it
const NativeImage = window.Image;
import {
  Settings,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Clock,
  Bell,
  Plus,
  Eye,
  MessageSquare,
  Star,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Heart,
  Target,
  RefreshCw,
  BadgeCheck,
  Upload,
  UserCircle,
  Image,
  Instagram,
  Trash2,
  X,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const InfluencerDashboard: React.FC = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('');
  const [popup, setPopup] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [socials, setSocials] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const profilePhotoInputRef = React.useRef<HTMLInputElement>(null);
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const portfolioFileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedPortfolioImages, setSelectedPortfolioImages] = useState<Set<number>>(new Set());
  const [showManagePortfolio, setShowManagePortfolio] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch(apiUrl("/api/profile"), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const profileData = data.user || data;
        setProfile(profileData);
        if (profileData) {
          setName(profileData.name || '');
          setEmail(profileData.email || '');
          setBio(profileData.bio || '');
          setInterests(profileData.interests || '');
          setSkills(profileData.skills || '');
          setLocation(profileData.location || '');
          setExperience(profileData.experience || '');
          setSocials(profileData.socials || '');
          setProfilePhoto(profileData.profile_photo || '');
          
          // Parse portfolio_images if it's a string and filter invalid images
          if (profileData && profileData.portfolio_images) {
            if (typeof profileData.portfolio_images === 'string') {
              try {
                const parsed = JSON.parse(profileData.portfolio_images);
                profileData.portfolio_images = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
              } catch (e) {
                console.error('Error parsing portfolio_images:', e);
                // If it's a single base64 string, wrap it in array
                profileData.portfolio_images = profileData.portfolio_images.startsWith('data:image/') 
                  ? [profileData.portfolio_images] 
                  : [];
              }
            } else if (!Array.isArray(profileData.portfolio_images)) {
              profileData.portfolio_images = [profileData.portfolio_images];
            }
            // Filter out invalid images
            profileData.portfolio_images = profileData.portfolio_images.filter((img: any) => 
              img && 
              typeof img === 'string' && 
              img.startsWith('data:image/') &&
              img.length > 100
            );
          } else if (profileData) {
            profileData.portfolio_images = [];
          }
          
          setPortfolioDescription(profileData.portfolio_description || '');
          setInstagramHandle(profileData.instagram_handle || '');
        }
      }
    };
    fetchProfile();
  }, []);

  // Helper function to compress image (for portfolio - larger size)
  const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.85): Promise<string> => {
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
            const img = new NativeImage();
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

    // Reset file input immediately
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.value = '';
    }

    if (!file.type.startsWith('image/')) {
      setPopup('Please select an image file');
      return;
    }

    // Allow larger files since we'll compress them
    if (file.size > 20 * 1024 * 1024) {
      setPopup('Image size must be less than 20MB');
      return;
    }

    setUploadingProfilePhoto(true);
    setPopup('Compressing image...');
    
    try {
      console.log('Starting compression for profile photo...');
      // Compress image (smaller size for profile photo - 800x800)
      const compressedBase64 = await compressImage(file, 800, 800, 0.9);
      console.log('Profile photo compression complete, size:', compressedBase64.length);
      
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

  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input immediately to allow re-selection
    if (portfolioFileInputRef.current) {
      portfolioFileInputRef.current.value = '';
    }

    if (!file.type.startsWith('image/')) {
      setPopup('Please select an image file');
      return;
    }

    // Allow larger files since we'll compress them
    if (file.size > 20 * 1024 * 1024) {
      setPopup('Image size must be less than 20MB');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setPopup('Please log in to upload images');
      return;
    }

    // Check current portfolio count - refresh profile first to ensure accurate count and clean data
    try {
      const profileCheckRes = await fetch(apiUrl("/api/profile"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileCheckRes.ok) {
        const profileCheckData = await profileCheckRes.json();
        const userCheckData = profileCheckData.user || profileCheckData;
        let currentImages = [];
        if (userCheckData.portfolio_images) {
          if (typeof userCheckData.portfolio_images === 'string') {
            try {
              const parsed = JSON.parse(userCheckData.portfolio_images);
              currentImages = Array.isArray(parsed) ? parsed.filter((img: any) => img && typeof img === 'string' && img.startsWith('data:image/')) : [];
            } catch {
              currentImages = [];
            }
          } else if (Array.isArray(userCheckData.portfolio_images)) {
            currentImages = userCheckData.portfolio_images.filter((img: any) => img && typeof img === 'string' && img.startsWith('data:image/'));
          }
        }
        
        if (currentImages.length >= 20) {
          setPopup('Portfolio is full (20 images max). Please remove some images first.');
          return;
        }
      }
    } catch (checkErr) {
      console.error('Error checking portfolio count:', checkErr);
      // Continue with upload attempt if check fails
    }

    setUploadingPortfolio(true);
    setPopup('Compressing and uploading image...');
    
    try {
      console.log('Starting compression for portfolio image...');
      // Compress image before uploading
      const compressedBase64 = await compressImage(file, 1920, 1920, 0.85);
      console.log('Compression complete, size:', compressedBase64.length);
      
      if (!compressedBase64 || compressedBase64.length === 0) {
        throw new Error('Compression failed - empty result');
      }
      
      // Ensure image has data:image/ prefix
      const imageToSave = compressedBase64.startsWith('data:image/') 
        ? compressedBase64 
        : `data:image/jpeg;base64,${compressedBase64}`;
      
      // Validate the image string before sending
      if (!imageToSave || imageToSave.length < 100) {
        throw new Error('Invalid image data - image too small or corrupted');
      }
      
      if (!imageToSave.startsWith('data:image/')) {
        throw new Error('Invalid image format - missing data:image/ prefix');
      }
      
      console.log('Uploading image, size:', imageToSave.length, 'starts with data:image/:', imageToSave.startsWith('data:image/'));
      
      // Upload immediately to backend
      const res = await fetch(apiUrl("/api/profile/portfolio"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image: imageToSave })
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Failed to save image' };
        }
        
        // Handle specific error messages gracefully
        const errorMessage = errorData.error || 'Failed to save portfolio image';
        console.error('Portfolio upload error response:', errorMessage, errorData);
        
        if (errorMessage.includes('Maximum 20 portfolio images')) {
          setPopup('Portfolio is full (20 images max). Please remove some images first.');
        } else if (errorMessage.includes('Invalid image format')) {
          setPopup('Invalid image format. Please try uploading a different image.');
        } else {
          setPopup(`Upload failed: ${errorMessage}. Please try again or clear all images first.`);
        }
        setUploadingPortfolio(false);
        return;
      }

      // Get the response data
      const responseData = await res.json();
      console.log('Upload response:', responseData);
      
      // Refresh profile to get updated portfolio images
      const profileRes = await fetch(apiUrl("/api/profile"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const userData = profileData.user || profileData;
        if (userData.portfolio_images && typeof userData.portfolio_images === 'string') {
          try {
            userData.portfolio_images = JSON.parse(userData.portfolio_images);
          } catch {
            userData.portfolio_images = [];
          }
        } else if (!userData.portfolio_images) {
          userData.portfolio_images = [];
        }
        // Filter out any invalid images
        userData.portfolio_images = userData.portfolio_images.filter((img: any) => 
          img && 
          typeof img === 'string' && 
          img.startsWith('data:image/') &&
          img.length > 100
        );
        setProfile(userData);
      }
      
      setPopup('Image uploaded successfully!');
      setTimeout(() => setPopup(''), 2000);
      setUploadingPortfolio(false);
    } catch (fetchErr: any) {
      console.error('Portfolio image upload error:', fetchErr);
      setPopup(fetchErr.message || 'Failed to upload image. Please try again.');
      setUploadingPortfolio(false);
    }
  };

  const handleRemovePortfolioImages = async () => {
    if (selectedPortfolioImages.size === 0) {
      setPopup('Please select images to remove');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setPopup('Please log in to remove images');
      return;
    }

    const currentImages = profile?.portfolio_images || [];
    const imagesArray = Array.isArray(currentImages) ? currentImages : (currentImages ? [currentImages] : []);
    
    // Remove selected images (sort indices descending to avoid index shifting)
    const sortedIndices = Array.from(selectedPortfolioImages).sort((a, b) => b - a);
    
    try {
      setPopup('Removing images...');
      
      // Delete images from backend (by index)
      for (const index of sortedIndices) {
        if (index < imagesArray.length) {
          const res = await fetch(`apiUrl("/api/profile/portfolio/${index}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!res.ok) {
            console.error(`Failed to delete image at index ${index}`);
          }
        }
      }

      // Refresh profile to get updated portfolio images
      const profileRes = await fetch(apiUrl("/api/profile"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const userData = profileData.user || profileData;
        if (userData.portfolio_images && typeof userData.portfolio_images === 'string') {
          try {
            userData.portfolio_images = JSON.parse(userData.portfolio_images);
          } catch {
            userData.portfolio_images = [];
          }
        } else if (!userData.portfolio_images) {
          userData.portfolio_images = [];
        }
        // Filter out any invalid images
        userData.portfolio_images = userData.portfolio_images.filter((img: any) => img && typeof img === 'string' && img.startsWith('data:image/'));
        setProfile(userData);
      }
      
      setSelectedPortfolioImages(new Set());
      setPopup(`Removed ${sortedIndices.length} image(s) successfully!`);
      setTimeout(() => setPopup(''), 2000);
    } catch (err: any) {
      console.error('Remove portfolio images error:', err);
      setPopup(err.message || 'Failed to remove images. Please try again.');
    }
  };

  const handleClearAllPortfolioImages = async () => {
    const currentImages = profile?.portfolio_images || [];
    const imagesArray = Array.isArray(currentImages) 
      ? currentImages.filter((img: any) => img && typeof img === 'string' && img.startsWith('data:image/'))
      : (currentImages && typeof currentImages === 'string' && currentImages.startsWith('data:image/') ? [currentImages] : []);
    
    if (imagesArray.length === 0) {
      setPopup('No images to remove');
      return;
    }

    if (!confirm(`Are you sure you want to delete all ${imagesArray.length} portfolio images? This action cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setPopup('Please log in to remove images');
      return;
    }

    try {
      setPopup('Removing all images...');
      
      // Directly update portfolio_images to empty array using profile update endpoint
      const res = await fetch(apiUrl("/api/profile"), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ portfolio_images: [] })
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Failed to clear portfolio' };
        }
        throw new Error(errorData.error || 'Failed to clear portfolio images');
      }

      // Refresh profile to get updated portfolio images
      const profileRes = await fetch(apiUrl("/api/profile"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const userData = profileData.user || profileData;
        if (userData.portfolio_images && typeof userData.portfolio_images === 'string') {
          try {
            userData.portfolio_images = JSON.parse(userData.portfolio_images);
          } catch {
            userData.portfolio_images = [];
          }
        } else if (!userData.portfolio_images) {
          userData.portfolio_images = [];
        }
        // Ensure it's an empty array
        userData.portfolio_images = [];
        setProfile(userData);
      }
      
      setSelectedPortfolioImages(new Set());
      setPopup(`All ${imagesArray.length} image(s) removed successfully!`);
      setTimeout(() => setPopup(''), 2000);
    } catch (err: any) {
      console.error('Clear all portfolio images error:', err);
      setPopup(err.message || 'Failed to remove images. Please try again.');
    }
  };

  const handleSavePortfolio = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPopup('Please log in to save portfolio');
      return;
    }

    // Check if there are any changes to save
    if (!portfolioDescription && !instagramHandle) {
      setPopup('No changes to save');
      return;
    }

    try {
      setPopup('Saving portfolio details...');
      
      // Save portfolio description and Instagram handle
      const updateBody: any = {};
      if (portfolioDescription !== undefined) {
        updateBody.portfolio_description = portfolioDescription;
      }
      if (instagramHandle !== undefined) {
        updateBody.instagram_handle = instagramHandle;
      }
      
      const res = await fetch(apiUrl("/api/profile"), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateBody)
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Failed to save portfolio details' };
        }
        throw new Error(errorData.error || 'Failed to save portfolio details');
      }

      // Refresh profile to get updated data
      const refreshRes = await fetch(apiUrl("/api/profile"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const userData = refreshData.user || refreshData;
        if (userData.portfolio_images && typeof userData.portfolio_images === 'string') {
          try {
            userData.portfolio_images = JSON.parse(userData.portfolio_images);
          } catch {
            userData.portfolio_images = [];
          }
        } else if (!userData.portfolio_images) {
          userData.portfolio_images = [];
        }
        // Filter out any invalid images
        userData.portfolio_images = userData.portfolio_images.filter((img: any) => img && typeof img === 'string' && img.startsWith('data:image/'));
        setProfile(userData);
        setPortfolioDescription(userData.portfolio_description || '');
        setInstagramHandle(userData.instagram_handle || '');
      }

      setPopup('Portfolio details saved successfully!');
      setTimeout(() => setPopup(''), 2000);
    } catch (err: any) {
      console.error('Save portfolio error:', err);
      setPopup(err.message || 'Failed to save portfolio');
    }
  };

  const toggleImageSelection = (index: number) => {
    const newSelected = new Set(selectedPortfolioImages);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPortfolioImages(newSelected);
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Add API calls when endpoints are ready
      } catch {
        setCampaigns([
          { name: 'Brand Collab with XYZ', status: 'Active', earnings: '₹500' },
          { name: 'Instagram Shoutout', status: 'Completed', earnings: '₹200' },
        ]);
        setSchedule([
          { date: '2025-10-05', event: 'Live Q&A with Brand A' },
          { date: '2025-10-10', event: 'Photo Shoot' },
        ]);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPopup('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl("/api/profile"), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          bio,
          interests,
          skills,
          location,
          experience,
          socials,
          profile_photo: profilePhoto
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile update failed');
      
      // Refresh profile to get updated data
      const profileRes = await fetch(apiUrl("/api/profile"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const userData = profileData.user || profileData;
        setProfile(userData);
        setProfilePhoto(userData.profile_photo || '');
        
        // Update user context with profile photo
        if (userData.profile_photo) {
          setUser({ ...user, profile_photo: userData.profile_photo });
        }
      }
      
      setPopup('Profile updated successfully!');
      setTimeout(() => setPopup(''), 2000);
    } catch (err: any) {
      setPopup(err.message);
    }
  };


  const activeCampaigns = campaigns.filter((c: any) => c.status === 'Active');
  const totalEarnings = campaigns
    .filter((c: any) => c.status === 'Completed')
    .reduce((sum: number, c: any) => sum + (parseFloat(c.earnings?.replace('₹', '').replace(',', '')) || 0), 0);

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <InfluencerNavbar />
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-pink-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-[32px] border border-white/10 bg-gradient-to-br from-pink-600/20 via-purple-600/20 to-indigo-500/20 p-8 backdrop-blur shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-pink-900/40">
                {(profile?.name || user?.name || 'I').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-4xl font-black text-white">
                    Hey {profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Creator'}! 👋
                  </h1>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/30">
                    <BadgeCheck className="h-4 w-4 text-pink-300" />
                    <span className="text-sm font-semibold text-pink-300">Influencer Account</span>
                  </div>
                </div>
                <p className="text-white/70">{profile?.bio || 'Manage your campaigns and collaborations'}</p>
                <div className="flex items-center gap-4 mt-4">
                  {profile?.location && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile?.interests && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Heart className="h-4 w-4" />
                      {profile.interests.split(',')[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/influencer/campaigns')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-400 text-white rounded-full font-bold shadow-lg shadow-pink-900/40 transition hover:scale-105"
            >
              <Target className="h-5 w-5" />
              Find Campaigns
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-pink-500/20 p-2">
                <TrendingUp className="h-5 w-5 text-pink-300" />
              </div>
              <span className="text-xs text-white/50">Active</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{activeCampaigns.length}</p>
            <p className="text-sm text-white/60">Campaigns</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-purple-500/20 p-2">
                <CalendarDays className="h-5 w-5 text-purple-300" />
              </div>
              <span className="text-xs text-white/50">Upcoming</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{schedule.length}</p>
            <p className="text-sm text-white/60">Events</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-green-500/20 p-2">
                <DollarSign className="h-5 w-5 text-green-300" />
              </div>
              <span className="text-xs text-white/50">Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">₹{totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-white/60">Earnings</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-amber-500/20 p-2">
                <Star className="h-5 w-5 text-amber-300" />
              </div>
              <span className="text-xs text-white/50">Rating</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">4.8</p>
            <p className="text-sm text-white/60">Avg. Rating</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Campaigns Section */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Active Campaigns</h2>
              <button
                onClick={() => navigate('/influencer/campaigns')}
                className="text-sm text-pink-300 hover:text-pink-200 transition"
              >
                Find more
              </button>
            </div>
            {campaigns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
                <Target className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60 mb-4">No active campaigns</p>
                <button
                  onClick={() => navigate('/influencer/campaigns')}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-400 text-white rounded-full text-sm font-semibold"
                >
                  Browse opportunities
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.slice(0, 4).map((c: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-pink-300/40 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{c.name || 'Campaign'}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {c.earnings || '₹0'}
                          </span>
                          {c.date && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {c.date}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          c.status === 'Active'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : c.status === 'Completed'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-white/10 text-white/60 border border-white/20'
                        }`}>
                          {c.status || 'Active'}
                        </span>
                        <ArrowRight className="h-4 w-4 text-white/40" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/influencer/campaigns')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-left"
                >
                  <Target className="h-5 w-5 text-pink-300" />
                  <span className="text-white">Find Campaigns</span>
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-left"
                >
                  <Eye className="h-5 w-5 text-purple-300" />
                  <span className="text-white">Browse Providers</span>
                </button>
                <button
                  onClick={() => navigate('/booking')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-left"
                >
                  <CalendarDays className="h-5 w-5 text-green-300" />
                  <span className="text-white">View Schedule</span>
                </button>
                <button
                  onClick={() => navigate('/chat/index')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-left"
                >
                  <MessageSquare className="h-5 w-5 text-cyan-300" />
                  <span className="text-white">Messages</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="text-lg font-bold text-white mb-4">Profile Status</h3>
              <div className="space-y-3">
                {[
                  { label: 'Bio', value: profile?.bio ? 'Complete' : 'Incomplete', icon: CheckCircle2 },
                  { label: 'Socials', value: profile?.socials ? 'Complete' : 'Incomplete', icon: Heart },
                  { label: 'Location', value: profile?.location ? 'Complete' : 'Incomplete', icon: MapPin },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className={`h-4 w-4 ${item.value === 'Complete' ? 'text-green-400' : 'text-white/40'}`} />
                      <span className="text-sm text-white/80">{item.label}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.value === 'Complete'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                className="w-full mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition border border-white/20"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Upcoming Schedule</h2>
            <button
              onClick={() => navigate('/booking')}
              className="text-sm text-pink-300 hover:text-pink-200 transition"
            >
              View calendar
            </button>
          </div>
          {schedule.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
              <CalendarDays className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.slice(0, 5).map((s: any, i: number) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-pink-300/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{s.event || 'Event'}</h3>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Clock className="h-4 w-4" />
                        {s.date || 'TBD'}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Display Section - Above Settings */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">My Portfolio</h2>
            <button
              onClick={() => setShowManagePortfolio(!showManagePortfolio)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 text-pink-300 rounded-lg hover:bg-pink-500/30 transition text-sm font-medium"
            >
              {showManagePortfolio ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Management
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Manage Portfolio
                </>
              )}
            </button>
          </div>
          
          {/* Portfolio Images */}
          {(() => {
            const portfolioImages = profile?.portfolio_images || [];
            const imagesArray = Array.isArray(portfolioImages) 
              ? portfolioImages.filter((img: any) => img && typeof img === 'string' && img.startsWith('data:image/'))
              : (portfolioImages && typeof portfolioImages === 'string' && portfolioImages.startsWith('data:image/') ? [portfolioImages] : []);
            
            if (imagesArray.length > 0) {
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                  {imagesArray.map((img: string, index: number) => (
                    <div
                      key={index}
                      className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition ${
                        selectedPortfolioImages.has(index)
                          ? 'border-red-400 ring-2 ring-red-400/50'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                      {showManagePortfolio && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            onClick={() => toggleImageSelection(index)}
                            className={`p-2 rounded-full ${
                              selectedPortfolioImages.has(index)
                                ? 'bg-red-500 text-white'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                            title={selectedPortfolioImages.has(index) ? 'Deselect for removal' : 'Select to remove'}
                          >
                            {selectedPortfolioImages.has(index) ? (
                              <X className="h-5 w-5" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            } else {
              return (
                <p className="text-white/60 text-center py-8 mb-6">No portfolio images yet. Click "Manage Portfolio" to add images.</p>
              );
            }
          })()}
          
          {/* Portfolio Description */}
          {profile?.portfolio_description && (
            <div className="mb-4 pb-4 border-b border-white/10">
              <p className="text-white/80 leading-relaxed">{profile.portfolio_description}</p>
            </div>
          )}
          
          {/* Instagram Handle */}
          {profile?.instagram_handle && (
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-400" />
              <a
                href={`https://instagram.com/${profile.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 transition font-medium"
              >
                @{profile.instagram_handle}
              </a>
            </div>
          )}
          
        </div>

        {/* Portfolio Management Section - Shows directly below portfolio when expanded */}
        {showManagePortfolio && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Portfolio Images */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">
                  Portfolio Images ({(() => {
                    const portfolioImages = profile?.portfolio_images || [];
                    const imagesArray = Array.isArray(portfolioImages) 
                      ? portfolioImages.filter((img: any) => img && typeof img === 'string' && img.startsWith('data:image/'))
                      : (portfolioImages && typeof portfolioImages === 'string' && portfolioImages.startsWith('data:image/') ? [portfolioImages] : []);
                    return imagesArray.length;
                  })()}/20)
                </label>
                {(() => {
                  const portfolioImages = profile?.portfolio_images || [];
                  const imagesArray = Array.isArray(portfolioImages) 
                    ? portfolioImages.filter((img: any) => img && typeof img === 'string' && img.startsWith('data:image/'))
                    : (portfolioImages && typeof portfolioImages === 'string' && portfolioImages.startsWith('data:image/') ? [portfolioImages] : []);
                  
                  if (imagesArray.length > 0) {
                    return (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {imagesArray.map((img: string, index: number) => (
                          <div 
                            key={index} 
                            className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                              selectedPortfolioImages.has(index)
                                ? 'border-red-400 ring-2 ring-red-400/50'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                            onClick={() => toggleImageSelection(index)}
                          >
                            <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              {selectedPortfolioImages.has(index) ? (
                                <X className="h-6 w-6 text-red-400" />
                              ) : (
                                <Trash2 className="h-6 w-6 text-white" />
                              )}
                            </div>
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <div className="rounded-xl border border-dashed border-white/20 p-8 text-center mb-3">
                        <Image className="h-12 w-12 text-white/30 mx-auto mb-4" />
                        <p className="text-white/60 mb-4">No portfolio images yet</p>
                      </div>
                    );
                  }
                })()}
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => portfolioFileInputRef.current?.click()}
                      disabled={uploadingPortfolio || (() => {
                        const portfolioImages = profile?.portfolio_images || [];
                        const imagesArray = Array.isArray(portfolioImages) 
                          ? portfolioImages.filter((img: any) => img && typeof img === 'string' && img.startsWith('data:image/'))
                          : (portfolioImages && typeof portfolioImages === 'string' && portfolioImages.startsWith('data:image/') ? [portfolioImages] : []);
                        return imagesArray.length >= 20;
                      })()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-500/20 text-pink-300 rounded-lg hover:bg-pink-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingPortfolio ? 'Uploading...' : 'Add Image'}
                    </button>
                    {selectedPortfolioImages.size > 0 && (
                      <button
                        onClick={handleRemovePortfolioImages}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove ({selectedPortfolioImages.size})
                      </button>
                    )}
                  </div>
                  {(() => {
                    const portfolioImages = profile?.portfolio_images || [];
                    const imagesArray = Array.isArray(portfolioImages) 
                      ? portfolioImages.filter((img: any) => img && typeof img === 'string' && img.startsWith('data:image/'))
                      : (portfolioImages && typeof portfolioImages === 'string' && portfolioImages.startsWith('data:image/') ? [portfolioImages] : []);
                    return imagesArray.length > 0 ? (
                      <button
                        onClick={handleClearAllPortfolioImages}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition border border-red-500/30"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear All Images ({imagesArray.length})
                      </button>
                    ) : null;
                  })()}
                </div>
                <input
                  ref={portfolioFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePortfolioImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-white/50 mt-2">Max 20 images, 20MB each (will be compressed)</p>
              </div>

              {/* Portfolio Description & Instagram */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Portfolio Description</label>
                  <textarea
                    value={portfolioDescription}
                    onChange={(e) => setPortfolioDescription(e.target.value)}
                    placeholder="Brief description of your work, style, and expertise..."
                    rows={4}
                    className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder:text-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Instagram Handle</label>
                  <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-400" />
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))}
                      placeholder="your_instagram_handle"
                      className="flex-1 px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-pink-400 text-white placeholder:text-white/40"
                    />
                  </div>
                  {instagramHandle && (
                    <a
                      href={`https://instagram.com/${instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-pink-300 hover:text-pink-200 mt-1 inline-block"
                    >
                      View @{instagramHandle} on Instagram →
                    </a>
                  )}
                </div>
              </div>
            </div>
            
          {/* Save Portfolio Button - Only show if description or Instagram handle changed */}
          {(portfolioDescription !== (profile?.portfolio_description || '') || instagramHandle !== (profile?.instagram_handle || '')) && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setPortfolioDescription(profile?.portfolio_description || '');
                  setInstagramHandle(profile?.instagram_handle || '');
                  setPopup('Changes discarded');
                  setTimeout(() => setPopup(''), 2000);
                }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePortfolio}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-400 text-white rounded-lg font-bold shadow-lg shadow-pink-900/40 transition hover:scale-105"
              >
                <Save className="h-4 w-4" />
                Save Details
              </button>
            </div>
          )}
          </div>
        )}

        {/* Settings Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
              <p className="text-white/60">Update your profile information</p>
            </div>
            <div className="rounded-xl bg-pink-500/20 p-3">
              <Settings className="h-6 w-6 text-pink-300" />
            </div>
          </div>

          {/* Profile Photo Upload */}
          <div className="mb-6 pb-6 border-b border-white/10">
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
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-400 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/20">
                    {(profile?.name || user?.name || 'I').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
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
            </div>
          </div>

          {/* Account Type & Role Switching */}
          <div className="mb-6 pb-6 border-b border-white/10">
            <label className="block text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-pink-300" />
              Account Type
            </label>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-medium mb-1">Current Account Type</p>
                  <p className="text-white/60 text-sm">You're currently using an Influencer account</p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 border border-pink-400/30">
                  <BadgeCheck className="h-4 w-4 text-pink-300" />
                  <span className="text-sm font-semibold text-pink-300">Influencer</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/70 text-sm mb-3">Switch to Provider account to offer services and manage bookings</p>
                <button
                  onClick={async () => {
                    if (!confirm('Are you sure you want to switch to a Provider account? You will be redirected to the Provider dashboard.')) {
                      return;
                    }
                    setSwitchingRole(true);
                    try {
                      const token = localStorage.getItem('token');
                      if (!token) {
                        setPopup('Please log in to change account type');
                        return;
                      }
                      const res = await fetch(apiUrl("/api/profile"), {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ role: 'provider' })
                      });
                      if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || 'Failed to switch account type');
                      }
                      setPopup('Account type changed successfully! Redirecting...');
                      // Update user context
                      setUser({ ...user, role: 'provider' });
                      setTimeout(() => {
                        navigate('/provider/dashboard');
                        window.location.reload();
                      }, 1500);
                    } catch (err: any) {
                      console.error('Role switch error:', err);
                      setPopup(err.message || 'Failed to switch account type');
                      setSwitchingRole(false);
                    }
                  }}
                  disabled={switchingRole}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed border border-purple-500/30"
                >
                  {switchingRole ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Switching...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Switch to Provider Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleProfileSave}>
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
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-400 text-white rounded-xl font-bold shadow-lg shadow-pink-900/40 transition hover:scale-[1.02]"
            >
              Save Changes
            </button>
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
        </div>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
