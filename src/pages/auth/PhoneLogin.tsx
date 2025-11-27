// Add type declaration for window.recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: any;
  }
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Smartphone, Lock, Sparkles } from 'lucide-react';
import { apiUrl } from '@/lib/api';

const PhoneLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<any>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    return () => {
      // Cleanup reCAPTCHA on unmount
      if (window.recaptchaVerifier) {
        try {
          if (window.recaptchaVerifier.clear) {
            window.recaptchaVerifier.clear();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const ensureRecaptcha = async () => {
    // Return existing verifier if available
    if (window.recaptchaVerifier) {
      try {
        // Verify it's still valid
        const container = document.getElementById('recaptcha-container');
        if (container) {
          return window.recaptchaVerifier;
        }
      } catch (e) {
        // If invalid, clear it and recreate
        window.recaptchaVerifier = undefined;
      }
    }

    // Wait for container to be available
    const container = document.getElementById('recaptcha-container');
    if (!container) {
      throw new Error('Recaptcha container not found. Please refresh the page.');
    }

    // Clear any existing content in container
    container.innerHTML = '';

    try {
      const verifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => setStatus('Code sent. Check your phone.'),
          'expired-callback': () => {
            setStatus('Recaptcha expired. Please try again.');
            window.recaptchaVerifier = undefined;
          },
        },
      );
      
      await verifier.render();
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (err: any) {
      // Clear on error
      window.recaptchaVerifier = undefined;
      if (container) {
        container.innerHTML = '';
      }
      throw err;
    }
  };

  const sendOtp = async () => {
    // Validate phone number format (E.164)
    const cleanPhone = phone.replace(/\s|-/g, '');
    if (!/^\+\d{10,15}$/.test(cleanPhone)) {
      setStatus('Enter a valid phone number in international format, e.g. +91 98765 43210');
      return;
    }
    setStatus('Sending code...');
    try {
      const verifier = await ensureRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, cleanPhone, verifier);
      setConfirmation(confirmationResult);
      setStatus('Code sent. Check your phone.');
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to send code';
      
      // Handle specific Firebase errors with user-friendly messages
      if (err.code === 'auth/billing-not-enabled') {
        errorMessage = 'Phone authentication requires billing to be enabled on your Firebase project. Please contact support or use email/Google login.';
      } else if (err.code === 'auth/quota-exceeded') {
        errorMessage = 'Phone verification quota exceeded. Please try again later or use email/Google login.';
      } else if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please enter in international format (e.g., +91 98765 43210).';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      }
      
      setStatus(errorMessage);
    }
  };

  const verifyCode = async () => {
    if (!confirmation) return setStatus('No confirmation available');
    setStatus('Verifying...');
    try {
      const result = await confirmation.confirm(code);
      const idToken = await result.user.getIdToken();
      // send idToken to backend to create session (reuse firebase flow)
      const res = await fetch(apiUrl('/api/auth/firebase'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      localStorage.setItem('token', data.token);
      if (data.user) {
        setUser(data.user);
      }
      
      // Redirect to role selection if user needs to choose role
      if (data.needsRoleSelection) {
        setStatus('Please select your role to continue...');
        setTimeout(() => navigate('/auth/select-role', { state: { from: '/' } }), 800);
      } else {
        setStatus('Logged in! Redirecting...');
        setTimeout(() => navigate('/'), 800);
      }
    } catch (err: any) {
      setStatus(err.message || 'Verification failed');
    }
  };

  try {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#020510] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-16 -top-32 h-72 w-72 rounded-full bg-purple-600 blur-[140px]" />
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500 blur-[140px]" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-screen items-center justify-center px-4 py-12">
          <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-lg lg:grid-cols-[1.1fr,0.9fr]">
            <div className="hidden flex-col gap-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-500 p-10 text-white lg:flex">
              <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-white/70">
                <Sparkles className="h-4 w-4" />
                secure access
              </div>
              <h2 className="text-4xl font-black leading-tight">Sign in with your phone number.</h2>
              <p className="text-white/80">
                Get instant access with SMS verification. Your phone number is your key to secure, fast authentication.
              </p>
              <div className="rounded-2xl bg-white/15 p-5">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">why phone login</p>
                <ul className="mt-3 space-y-2 text-sm text-white/90">
                  <li>• No password to remember</li>
                  <li>• Fast SMS verification</li>
                  <li>• Secure one-time codes</li>
                </ul>
              </div>
            </div>
            <div className="bg-[#050713]/80 p-8">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.5em] text-white/40">phone verification</p>
                <h1 className="mt-2 text-3xl font-semibold">Sign in with Phone</h1>
                <p className="text-sm text-white/60">Enter your phone number to receive a verification code.</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Phone number
                  </label>
                  <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 px-4">
                    <Smartphone className="mr-3 h-4 w-4 text-white/50" />
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      className="h-12 flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/50">Enter in international format (e.g., +91 98765 43210)</p>
                </div>
                {/* Recaptcha container must be present in the DOM */}
                <div id="recaptcha-container"></div>
                <button
                  onClick={sendOtp}
                  disabled={!phone.trim()}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Code
                </button>

                {confirmation && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Verification code
                      </label>
                      <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 px-4">
                        <Lock className="mr-3 h-4 w-4 text-white/50" />
                        <input
                          value={code}
                          onChange={e => setCode(e.target.value)}
                          placeholder="123456"
                          autoComplete="one-time-code"
                          className="h-12 flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={verifyCode}
                      disabled={!code.trim()}
                      className="w-full rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-400 px-4 py-3 text-lg font-semibold text-white shadow-lg shadow-green-900/40 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify & Sign In
                    </button>
                  </>
                )}

                {status && (
                  <div
                    className={`rounded-2xl px-4 py-3 text-center text-sm ${
                      status.toLowerCase().includes("sent") || status.toLowerCase().includes("logged") || status.toLowerCase().includes("success")
                        ? "bg-emerald-500/10 text-emerald-300"
                        : status.toLowerCase().includes("error") || status.toLowerCase().includes("failed") || status.toLowerCase().includes("billing") || status.toLowerCase().includes("quota")
                        ? "bg-rose-500/10 text-rose-200"
                        : "bg-blue-500/10 text-blue-300"
                    }`}
                  >
                    {status}
                    {(status.toLowerCase().includes("billing") || status.toLowerCase().includes("quota")) && (
                      <div className="mt-2 text-xs text-rose-300/80">
                        You can still sign in using email or Google authentication.
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-2 text-sm text-white/60">
                  <button onClick={() => navigate('/auth/login')} className="text-white hover:text-cyan-300">
                    Back to Email / Google login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err: any) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020510] text-white">
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-8">
          <p className="text-red-400 font-bold">Error: {err.message || 'Something went wrong.'}</p>
        </div>
      </div>
    );
  }
};

export default PhoneLogin;
