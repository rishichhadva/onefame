import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CompleteProfileProvider = () => {
  const { user, login, setUser } = useAuth();
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [services, setServices] = useState('');
  const [popup, setPopup] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPopup('');
    if (!bio || !interests || !skills || !location || !experience || !services) {
      setPopup('All fields are required.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio, interests, skills, location, experience, services })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile update failed');
      setUser({
        ...user,
        bio,
        interests,
        skills,
        location,
        experience,
        services
      });
      setPopup('Profile completed! Redirecting...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err: any) {
      setPopup(err.message);
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/Login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-extrabold text-pink-700 text-center mb-4">Complete Your Provider Profile</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" required className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" rows={3} />
          <input type="text" value={interests} onChange={e => setInterests(e.target.value)} placeholder="Interests" required className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
          <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills" required className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" required className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
          <input type="text" value={experience} onChange={e => setExperience(e.target.value)} placeholder="Experience" required className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
          <input type="text" value={services} onChange={e => setServices(e.target.value)} placeholder="Offerings" required className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
          <button type="submit" className="w-full py-2 bg-pink-600 text-white rounded-full font-bold shadow hover:bg-pink-700 transition">Save Profile</button>
          {popup && <div className="mt-2 text-center px-4 py-2 rounded-xl bg-green-100 text-green-700">{popup}</div>}
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileProvider;
