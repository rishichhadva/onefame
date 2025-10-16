import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard: React.FC = () => {
  const { logout } = useAuth();
  const handleBack = () => navigate('/');
  const [tab, setTab] = useState('dashboard');
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Marketing & Brand Partnerships');
  const [popup, setPopup] = useState('');
  const [bookings, setBookings] = useState([
    { client: 'Jane Doe', offering: 'Instagram Shoutout', date: '2025-10-06', status: 'Confirmed' },
    { client: 'John Smith', offering: 'Brand Collaboration', date: '2025-10-12', status: 'Pending' },
  ]);
  const [services, setServices] = useState([
    { name: 'Instagram Shoutout', price: '$100', status: 'Active' },
    { name: 'Brand Collaboration', price: '$300', status: 'Inactive' },
  ]);
  const [interests, setInterests] = useState(user?.interests || '');
  const [skills, setSkills] = useState(user?.skills || '');
  const [location, setLocation] = useState(user?.location || '');
  const [experience, setExperience] = useState(user?.experience || '');
  const [servicesField, setServicesField] = useState(user?.services || '');
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
          setServicesField(profileData.services || '');
        }
      }
    };
    fetchProfile();
  }, []);

  // Only show setup prompt if backend profile fields are empty
  const isProfileComplete = profile && profile.bio && profile.interests && profile.skills && profile.location && profile.experience && profile.services &&
    profile.bio.trim() !== '' && profile.interests.trim() !== '' && profile.skills.trim() !== '' && 
    profile.location.trim() !== '' && profile.experience.trim() !== '' && profile.services.trim() !== '';

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsRes = await fetch('http://localhost:4000/api/bookings');
        setBookings(await bookingsRes.json());
        const servicesRes = await fetch('http://localhost:4000/api/services');
        setServices(await servicesRes.json());
      } catch {
        setBookings([
          { client: 'Jane Doe', offering: 'Instagram Shoutout', date: '2025-10-06', status: 'Confirmed' },
          { client: 'John Smith', offering: 'Brand Collaboration', date: '2025-10-12', status: 'Pending' },
        ]);
        setServices([
          { name: 'Instagram Shoutout', price: '$100', status: 'Active' },
          { name: 'Brand Collaboration', price: '$300', status: 'Inactive' },
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
          services: servicesField
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
        setServicesField(profileData.services || '');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleBack} className="text-blue-600 hover:text-blue-800 bg-blue-100 rounded-full px-4 py-2 font-bold">Back</button>
          <button onClick={() => setShowLogoutConfirm(true)} className="text-blue-600 hover:text-blue-800 bg-blue-100 rounded-full px-4 py-2 font-bold">Logout</button>
          {showLogoutConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-xl p-6 shadow-xl text-center">
                <p className="mb-4 text-lg font-semibold">Do you want to logout?</p>
                <button onClick={handleLogout} className="px-4 py-2 bg-blue-600 text-white rounded-full mr-2">Yes</button>
                <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 bg-gray-300 rounded-full">No</button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={profile?.avatar || 'https://i.pravatar.cc/80?img=8'} alt="avatar" className="w-20 h-20 rounded-full border-4 border-blue-200 shadow-lg" />
            <div>
              <h1 className="text-3xl font-bold text-blue-700">{profile?.name}</h1>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className={`px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${tab==='dashboard'?'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl':'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} onClick={()=>setTab('dashboard')}>Dashboard</button>
            <button className={`px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${tab==='settings'?'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl':'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} onClick={()=>setTab('settings')}>Settings</button>
          </div>
        </div>
        {tab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Profile Details</h2>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Name:</strong> {profile?.name || '-'} </div>
              <div><strong>Email:</strong> {profile?.email || '-'} </div>
              <div><strong>Bio:</strong> {profile?.bio || '-'} </div>
              <div><strong>Interests:</strong> {profile?.interests || '-'} </div>
              <div><strong>Skills:</strong> {profile?.skills || '-'} </div>
              <div><strong>Location:</strong> {profile?.location || '-'} </div>
              <div><strong>Experience:</strong> {profile?.experience || '-'} </div>
              <div><strong>Services:</strong> {profile?.services || '-'} </div>
            </div>
            <h2 className="text-2xl font-bold text-blue-700 mb-6">My Offerings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {services.map((s, i) => (
                <div key={i} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 flex flex-col gap-3">
                  <span className="font-bold text-blue-700 text-lg">{s.name}</span>
                  <span className="text-blue-600 font-bold">Price: {s.price}</span>
                  <span className={`text-xs px-2 py-1 rounded ${s.status==='Active'?'bg-green-100 text-green-700':'bg-gray-200 text-gray-700'}`}>{s.status}</span>
                </div>
              ))}
            </div>
            <h2 className="text-xl font-bold text-blue-700 mb-4">Bookings Received</h2>
            <ul className="divide-y divide-pink-100">
              {bookings.map((b, i) => (
                <li key={i} className="py-3 flex justify-between items-center">
                  <span className="font-semibold text-pink-600">{b.client} - {b.offering}</span>
                  <span className="text-sm text-gray-500">{b.date}</span>
                  <span className={`text-xs px-2 py-1 rounded ${b.status==='Confirmed'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/provider/ProvideServices')} className="mb-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-bold shadow hover:from-blue-700 hover:to-cyan-600 transition">Share Offerings</button>
          </div>
        )}
        {tab === 'settings' && (
          <div>
            <h2 className="text-xl font-bold text-blue-700 mb-4">Edit Profile</h2>
            <form className="space-y-4" onSubmit={handleProfileSave}>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500" />
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" className="w-full px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500" rows={3} />
              <input type="text" value={interests} onChange={e => setInterests(e.target.value)} placeholder="Interests" className="w-full px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500" />
              <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills" className="w-full px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500" />
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500" />
              <input type="text" value={experience} onChange={e => setExperience(e.target.value)} placeholder="Experience" className="w-full px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500" />
              <input type="text" value={servicesField} onChange={e => setServicesField(e.target.value)} placeholder="Offerings" className="w-full px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500" />
              <button type="submit" className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-bold shadow hover:from-blue-700 hover:to-cyan-600 transition">Save Changes</button>
              {popup && <div className="mt-2 text-center px-4 py-2 rounded-xl bg-green-100 text-green-700">{popup}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
