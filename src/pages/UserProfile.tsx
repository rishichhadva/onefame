import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const handleBack = () => window.history.back();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  if (!user) return <div className="text-center py-20 text-pink-600 font-bold text-xl">Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleBack} className="text-pink-600 hover:text-pink-800 bg-pink-100 rounded-full px-4 py-2 font-bold">Back</button>
        <button onClick={logout} className="text-pink-600 hover:text-pink-800 bg-pink-100 rounded-full px-4 py-2 font-bold">Logout</button>
      </div>
      <h1 className="text-4xl font-extrabold text-pink-700 mb-8 text-center">Your Profile</h1>
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <form className="space-y-6">
          <div>
            <label className="block text-pink-600 font-bold mb-2">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="block text-pink-600 font-bold mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="block text-pink-600 font-bold mb-2">Role</label>
            <input type="text" value={user.role || ''} disabled className="w-full px-4 py-2 border-2 border-pink-200 rounded-2xl bg-gray-100 text-gray-500" />
          </div>
          <button type="submit" className="px-6 py-2 bg-pink-600 text-white rounded-full font-semibold shadow hover:bg-pink-700 transition">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
