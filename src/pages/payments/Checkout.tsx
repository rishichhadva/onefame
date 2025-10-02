import React from 'react';

const CheckoutPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold mb-6">Secure Checkout</h1>
    <div className="bg-white p-6 rounded shadow mb-6">Payment Form (Stripe/Razorpay)</div>
    <div className="bg-white p-6 rounded shadow">Payment Status</div>
  </div>
);

export default CheckoutPage;
