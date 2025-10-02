import React from 'react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => (
  (() => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [password, setPassword] = useState('');
    const [popup, setPopup] = useState('');
    const { login, setUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setPopup('');
      try {
        // Special case for admin login
        if (email === 'admin@onefame.com' && password === 'admin12') {
          localStorage.setItem('token', 'admin-token');
          login('admin', 'Admin');
          setPopup('Logged in as admin! Redirecting...');
          setTimeout(() => navigate('/admin/dashboard'), 1200);
          return;
        }
        const res = await fetch('http://localhost:4000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        localStorage.setItem('token', data.token);
        // Fetch full user profile after login
        const profileRes = await fetch('http://localhost:4000/api/profile', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const profileData = await profileRes.json();
        const profile = profileData.user || profileData;
        setUser(profile);
        // After successful login, always redirect to hero page
        setPopup('Logged in successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1200);
      } catch (err) {
        setPopup(err.message);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-lg">
          <div className="flex flex-col items-center mb-4">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2"><circle cx="12" cy="12" r="10" fill="#f472b6"/><path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h2 className="text-3xl font-extrabold text-pink-700 text-center">Login to OneFame</h2>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500 text-lg" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500 text-lg" />
            <button type="submit" className="w-full py-3 bg-pink-600 text-white rounded-full text-lg font-bold shadow hover:bg-pink-700 transition">Login</button>
            <button type="button" onClick={() => { setEmail('admin@onefame.com'); setPassword('admin12'); setPopup(''); }} className="block w-full mt-4 py-3 rounded-full bg-gray-900 text-white text-lg font-bold shadow hover:bg-pink-700 transition text-center">Login as Admin</button>
            {popup && <div className={`mt-4 text-center px-4 py-2 rounded-xl ${popup.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{popup}</div>}
          </form>
          <div className="flex justify-between text-sm mt-2">
            <a href="/auth/Signup" className="text-pink-600 font-semibold hover:underline">Sign Up</a>
            <a href="/auth/ForgotPassword" className="text-pink-600 font-semibold hover:underline">Forgot Password?</a>
          </div>
        </div>
      </div>
    );
  })()
);

export default Login;
