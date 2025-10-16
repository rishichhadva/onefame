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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50">
        <div className="w-full max-w-md p-10 space-y-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent text-center">Welcome Back</h2>
            <p className="text-gray-600 text-center mt-2">Sign in to your OneFame account</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition-all" />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition-all" />
            </div>
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl text-lg font-bold shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              Sign In
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            <button type="button" onClick={() => { setEmail('admin@onefame.com'); setPassword('admin12'); setPopup(''); }} className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl text-lg font-bold shadow-lg hover:from-gray-900 hover:to-black transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Access
            </button>
            {popup && <div className={`mt-4 text-center px-6 py-3 rounded-2xl font-medium ${popup.includes('successfully') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{popup}</div>}
          </form>
          <div className="flex justify-between text-center mt-6">
            <p className="text-gray-600">New to OneFame? <a href="/auth/Signup" className="text-blue-600 font-semibold hover:text-cyan-600 transition-colors">Create account</a></p>
          </div>
          <div className="text-center mt-4">
            <a href="/auth/ForgotPassword" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Forgot your password?</a>
          </div>
        </div>
      </div>
    );
  })()
);

export default Login;
