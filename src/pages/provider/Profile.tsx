import React from 'react';

const ProviderProfile = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="flex justify-start mb-6">
      <button onClick={() => window.history.back()} className="text-pink-600 hover:text-pink-800 bg-pink-100 rounded-full px-4 py-2 font-bold">Back</button>
    </div>
    <h1 className="text-3xl font-bold mb-6">Service Provider Profile</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded shadow">Portfolio (Images/Videos)</div>
      <div className="bg-white p-6 rounded shadow">Pricing & Availability</div>
      <div className="bg-white p-6 rounded shadow">Reviews & Ratings</div>
    </div>
  </div>
);

export default ProviderProfile;
