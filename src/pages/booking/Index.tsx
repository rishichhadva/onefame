import React from 'react';

const BookingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 relative">
    <h1 className="text-5xl font-extrabold text-blue-700 mb-12 text-center">Booking & Scheduling</h1>
    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">Calendar View</h2>
      <div className="text-gray-700">(Sample calendar would go here)</div>
    </div>
    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">Booking Request Form</h2>
      <div className="text-gray-700">(Sample booking form would go here)</div>
    </div>
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">Booking Confirmation</h2>
      <div className="text-gray-700">(Sample confirmation would go here)</div>
    </div>
    <a href="/" className="absolute top-6 left-6 text-blue-600 hover:text-blue-800">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </a>
  </div>
);

export default BookingPage;
