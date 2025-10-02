import React from 'react';

const ForgotPassword = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
      <form className="space-y-4">
        <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded" />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send Reset Link</button>
      </form>
      <div className="flex justify-between text-sm">
        <a href="/auth/Login" className="text-blue-600">Back to Login</a>
      </div>
    </div>
  </div>
);

export default ForgotPassword;
