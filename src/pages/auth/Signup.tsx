import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => (
  (() => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('influencer');
    const [popup, setPopup] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setPopup('');
      try {
        const res = await fetch('http://localhost:4000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Sign up failed');
        // After successful signup, redirect to login with email pre-filled
        setPopup('Signup successful! Redirecting to login...');
        setTimeout(() => navigate('/auth/Login', { state: { email } }), 1200);
      } catch (err) {
        setPopup(err.message);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-lg">
          <div className="flex flex-col items-center mb-4">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2"><rect x="4" y="4" width="16" height="16" rx="8" fill="#f472b6"/><path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            <h2 className="text-3xl font-extrabold text-pink-700 text-center">Sign Up for OneFame</h2>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500 text-lg" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500 text-lg" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500 text-lg" />
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl text-lg">
              <option value="influencer">Influencer</option>
              <option value="provider">Service Provider</option>
            </select>
            <button type="submit" className="w-full py-3 bg-pink-600 text-white rounded-full text-lg font-bold shadow hover:bg-pink-700 transition">Sign Up</button>
            {popup && <div className={`mt-4 text-center px-4 py-2 rounded-xl ${popup.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{popup}</div>}
          </form>
          <div className="flex justify-between text-sm mt-2">
            <a href="/auth/Login" className="text-pink-600 font-semibold hover:underline">Already have an account?</a>
          </div>
          <div className="mt-6 text-center">
            <a href="/" className="px-4 py-2 rounded-full bg-pink-100 text-pink-700 font-semibold shadow hover:bg-pink-200 transition">Back to Home</a>
          </div>
        </div>
      </div>
    );
  })()
);

export default Signup;
