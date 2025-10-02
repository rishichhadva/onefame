import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompleteProfile = () => {
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [popup, setPopup] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/Login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ bio, interests, skills, location, experience })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile update failed');
      setPopup('Profile completed! Redirecting to dashboard...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setPopup(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-extrabold text-pink-700 text-center mb-4">Complete Your Profile</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500 text-lg" />
          <input type="text" value={interests} onChange={e => setInterests(e.target.value)} placeholder="Interests (comma separated)" className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl text-lg" />
          <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills (comma separated)" className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl text-lg" />
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl text-lg" />
          <input type="text" value={experience} onChange={e => setExperience(e.target.value)} placeholder="Experience (e.g. 3 years)" className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl text-lg" />
          <button type="submit" className="w-full py-3 bg-pink-600 text-white rounded-full text-lg font-bold shadow hover:bg-pink-700 transition">Complete Profile</button>
          {popup && <div className={`mt-4 text-center px-4 py-2 rounded-xl ${popup.includes('completed') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{popup}</div>}
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
