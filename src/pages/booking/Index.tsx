import React from 'react';

const BookingPage = () => (
  <div className="min-h-screen bg-pink-50 p-8 relative">
    <h1 className="text-4xl font-extrabold text-pink-700 mb-10 text-center">Booking & Scheduling</h1>
    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-pink-600 mb-4">Calendar View</h2>
      <div className="text-gray-700">(Sample calendar would go here)</div>
    </div>
    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-pink-600 mb-4">Booking Request Form</h2>
      <div className="text-gray-700">(Sample booking form would go here)</div>
    </div>
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-pink-600 mb-4">Booking Confirmation</h2>
      <div className="text-gray-700">(Sample confirmation would go here)</div>
    </div>
    <a href="/" className="absolute top-6 left-6 text-pink-600 hover:text-pink-800">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </a>
  </div>
);

export default BookingPage;
