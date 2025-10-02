import React from 'react';

const Footer = () => (
  <footer className="bg-gray-50 py-10 mt-16 rounded-2xl mx-4 mb-4 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex gap-6 mb-4 md:mb-0">
        <a href="/about" className="px-4 py-2 rounded-full text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition font-medium">About</a>
        <a href="/contact" className="px-4 py-2 rounded-full text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition font-medium">Contact</a>
        <a href="/terms" className="px-4 py-2 rounded-full text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition font-medium">Terms</a>
        <a href="/privacy" className="px-4 py-2 rounded-full text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition font-medium">Privacy</a>
      </div>
      <div className="w-full border-t border-pink-100 my-4 md:hidden"></div>
      <div className="text-gray-500 text-sm text-center md:text-right">© 2025 OneFame. All rights reserved.</div>
    </div>
  </footer>
);

export default Footer;
