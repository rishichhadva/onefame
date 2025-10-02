import React from 'react';

const Features = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Platform Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-pink-50 p-8 rounded-2xl shadow-lg text-center flex flex-col items-center">
          <h3 className="font-extrabold text-2xl mb-3 text-pink-700">Search & Discovery</h3>
          <p className="text-gray-700">Find the best service providers by category, location, budget, and rating.</p>
        </div>
        <div className="bg-pink-50 p-8 rounded-2xl shadow-lg text-center flex flex-col items-center">
          <h3 className="font-extrabold text-2xl mb-3 text-pink-700">Booking & Scheduling</h3>
          <p className="text-gray-700">Book services with calendar-based workflows and instant confirmations.</p>
        </div>
        <div className="bg-pink-50 p-8 rounded-2xl shadow-lg text-center flex flex-col items-center">
          <h3 className="font-extrabold text-2xl mb-3 text-pink-700">Secure Payments</h3>
          <p className="text-gray-700">Checkout with confidence using secure payment gateways.</p>
        </div>
      </div>
    </div>
  </section>
);

export default Features;
