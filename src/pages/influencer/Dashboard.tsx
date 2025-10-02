import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const InfluencerDashboard: React.FC = () => {
  const { logout } = useAuth();
  const handleBack = () => navigate('/');
  const [tab, setTab] = useState('dashboard');
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Fashion & Lifestyle Influencer');
  const [popup, setPopup] = useState('');
  const [campaigns, setCampaigns] = useState([
    { name: 'Brand Collab with XYZ', status: 'Active', earnings: '$500' },
    { name: 'Instagram Shoutout', status: 'Completed', earnings: '$200' },
  ]);
  const [schedule, setSchedule] = useState([
    { date: '2025-10-05', event: 'Live Q&A with Brand A' },
    { date: '2025-10-10', event: 'Photo Shoot' },
  ]);
  const [interests, setInterests] = useState(user?.interests || '');
  const [skills, setSkills] = useState(user?.skills || '');
  const [location, setLocation] = useState(user?.location || '');
  const [experience, setExperience] = useState(user?.experience || '');
  const [socials, setSocials] = useState(user?.socials || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch('http://localhost:4000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const profileData = data.user || data;
        setProfile(profileData);
        // Update form fields with backend data
        if (profileData) {
          setName(profileData.name || '');
          setEmail(profileData.email || '');
          setBio(profileData.bio || '');
          setInterests(profileData.interests || '');
          setSkills(profileData.skills || '');
          setLocation(profileData.location || '');
          setExperience(profileData.experience || '');
          setSocials(profileData.socials || '');
        }
      }
    };
    fetchProfile();
  }, []);

  // Only show setup prompt if backend profile fields are empty
  const isProfileComplete = profile && profile.bio && profile.interests && profile.skills && profile.location && profile.experience && profile.socials &&
    profile.bio.trim() !== '' && profile.interests.trim() !== '' && profile.skills.trim() !== '' && 
    profile.location.trim() !== '' && profile.experience.trim() !== '' && profile.socials.trim() !== '';

  React.useEffect(() => {
    const fetchData = async () => {
      // Replace with your backend API endpoints
      try {
        // Example: const res = await fetch('http://localhost:4000/api/campaigns');
        // setCampaigns(await res.json());
        // Example: const schedRes = await fetch('http://localhost:4000/api/schedule');
        // setSchedule(await schedRes.json());
      } catch {
        // fallback to static data
        setCampaigns([
          { name: 'Brand Collab with XYZ', status: 'Active', earnings: '$500' },
          { name: 'Instagram Shoutout', status: 'Completed', earnings: '$200' },
        ]);
        setSchedule([
          { date: '2025-10-05', event: 'Live Q&A with Brand A' },
          { date: '2025-10-10', event: 'Photo Shoot' },
        ]);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPopup('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/profile', {
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
          socials
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile update failed');
      setPopup('Profile updated successfully!');
      // Refetch profile from backend
      const res2 = await fetch('http://localhost:4000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data2 = await res2.json();
      const profileData = data2.user || data2;
      setProfile(profileData);
      // Update form fields with latest backend data
      if (profileData) {
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        setBio(profileData.bio || '');
        setInterests(profileData.interests || '');
        setSkills(profileData.skills || '');
        setLocation(profileData.location || '');
        setExperience(profileData.experience || '');
        setSocials(profileData.socials || '');
      }
      setTimeout(() => setPopup(''), 1500);
    } catch (err: any) {
      setPopup(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleBack} className="text-pink-600 hover:text-pink-800 bg-pink-100 rounded-full px-4 py-2 font-bold">Back</button>
          <button onClick={() => setShowLogoutConfirm(true)} className="text-pink-600 hover:text-pink-800 bg-pink-100 rounded-full px-4 py-2 font-bold">Logout</button>
          {showLogoutConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-xl p-6 shadow-xl text-center">
                <p className="mb-4 text-lg font-semibold">Do you want to logout?</p>
                <button onClick={handleLogout} className="px-4 py-2 bg-pink-600 text-white rounded-full mr-2">Yes</button>
                <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 bg-gray-300 rounded-full">No</button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={profile?.avatar || 'https://i.pravatar.cc/80?img=5'} alt="avatar" className="w-16 h-16 rounded-full border-4 border-pink-200" />
            <div>
              <h1 className="text-2xl font-bold text-pink-700">{profile?.name}</h1>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-full font-semibold ${tab==='dashboard'?'bg-pink-600 text-white':'bg-pink-100 text-pink-700'}`} onClick={()=>setTab('dashboard')}>Dashboard</button>
            <button className={`px-4 py-2 rounded-full font-semibold ${tab==='settings'?'bg-pink-600 text-white':'bg-pink-100 text-pink-700'}`} onClick={()=>setTab('settings')}>Settings</button>
          </div>
        </div>
        {tab === 'dashboard' && (
          <div>
            <h2 className="text-xl font-bold text-pink-700 mb-4">Profile Details</h2>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Name:</strong> {profile?.name || '-'} </div>
              <div><strong>Email:</strong> {profile?.email || '-'} </div>
              <div><strong>Bio:</strong> {profile?.bio || '-'} </div>
              <div><strong>Interests:</strong> {profile?.interests || '-'} </div>
              <div><strong>Skills:</strong> {profile?.skills || '-'} </div>
              <div><strong>Location:</strong> {profile?.location || '-'} </div>
              <div><strong>Experience:</strong> {profile?.experience || '-'} </div>
              <div><strong>Socials:</strong> {profile?.socials || '-'} </div>
            </div>
            <h2 className="text-xl font-bold text-pink-700 mb-4">My Campaigns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {campaigns.map((c, i) => (
                <div key={i} className="bg-pink-50 rounded-xl p-6 shadow flex flex-col gap-2">
                  <span className="font-semibold text-pink-700">{c.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${c.status==='Active'?'bg-green-100 text-green-700':'bg-gray-200 text-gray-700'}`}>{c.status}</span>
                  <span className="text-pink-600 font-bold">Earnings: {c.earnings}</span>
                </div>
              ))}
            </div>
            <h2 className="text-xl font-bold text-pink-700 mb-4">Upcoming Schedule</h2>
            <ul className="divide-y divide-pink-100">
              {schedule.map((s, i) => (
                <li key={i} className="py-3 flex justify-between items-center">
                  <span className="font-semibold text-pink-600">{s.event}</span>
                  <span className="text-sm text-gray-500">{s.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === 'settings' && (
          <div>
            <h2 className="text-xl font-bold text-pink-700 mb-4">Edit Profile</h2>
            <form className="space-y-4" onSubmit={handleProfileSave}>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" rows={3} />
              <input type="text" value={interests} onChange={e => setInterests(e.target.value)} placeholder="Interests" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
              <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
              <input type="text" value={experience} onChange={e => setExperience(e.target.value)} placeholder="Experience" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
              <input type="text" value={socials} onChange={e => setSocials(e.target.value)} placeholder="Socials" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
              <button type="submit" className="w-full py-2 bg-pink-600 text-white rounded-full font-bold shadow hover:bg-pink-700 transition">Save Changes</button>
              {popup && <div className="mt-2 text-center px-4 py-2 rounded-xl bg-green-100 text-green-700">{popup}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerDashboard;
