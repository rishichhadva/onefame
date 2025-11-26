import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="mx-auto mt-20 w-full max-w-6xl rounded-[32px] border border-white/10 bg-white/5 px-6 py-8 text-white shadow-xl shadow-black/40">
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-400 shadow-lg shadow-purple-900/40">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">OneFame</p>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Creators marketplace</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
        <Link to="/about" className="transition hover:text-white">
          About
        </Link>
        <Link to="/contact" className="transition hover:text-white">
          Contact
        </Link>
        <Link to="/terms" className="transition hover:text-white">
          Terms
        </Link>
        <Link to="/privacy" className="transition hover:text-white">
          Privacy
        </Link>
      </div>

      <p className="text-xs text-white/50">© {new Date().getFullYear()} OneFame. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
