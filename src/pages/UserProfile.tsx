import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const handleBack = () => window.history.back();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  if (!user) return <div className="text-center py-20 text-blue-600 font-bold text-xl">Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleBack} className="text-blue-600 hover:text-blue-800 bg-blue-100 rounded-full px-6 py-3 font-bold transition-all duration-300 hover:shadow-lg">Back</button>
        <button onClick={logout} className="text-blue-600 hover:text-blue-800 bg-blue-100 rounded-full px-6 py-3 font-bold transition-all duration-300 hover:shadow-lg">Logout</button>
      </div>
      <h1 className="text-5xl font-extrabold text-blue-700 mb-12 text-center">Your Profile</h1>
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <form className="space-y-6">
          <div>
            <label className="block text-blue-600 font-bold mb-2">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition-all" />
          </div>
          <div>
            <label className="block text-blue-600 font-bold mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition-all" />
          </div>
          <div>
            <label className="block text-blue-600 font-bold mb-2">Role</label>
            <input type="text" value={user.role || ''} disabled className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl bg-gray-100 text-gray-500 text-lg" />
          </div>
          <button type="submit" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold shadow-lg hover:from-blue-700 hover:to-cyan-700 transform hover:scale-105 transition-all text-lg">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
