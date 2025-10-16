import React from 'react';

const Features = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">Platform Features</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to connect, collaborate, and create amazing content</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 p-8 rounded-3xl shadow-2xl text-white hover:shadow-3xl transition-all duration-300 hover:-translate-y-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <h3 className="font-bold text-2xl mb-4">Smart Discovery</h3>
            <p className="text-blue-50 leading-relaxed">Advanced search and filtering to find the perfect providers by specialty, location, budget, and ratings.</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 to-indigo-600 p-8 rounded-3xl shadow-2xl text-white hover:shadow-3xl transition-all duration-300 hover:-translate-y-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <h3 className="font-bold text-2xl mb-4">Easy Booking</h3>
            <p className="text-cyan-50 leading-relaxed">Seamless calendar integration with instant confirmations and automated scheduling workflows.</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 p-8 rounded-3xl shadow-2xl text-white hover:shadow-3xl transition-all duration-300 hover:-translate-y-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="font-bold text-2xl mb-4">Secure Payments</h3>
            <p className="text-indigo-50 leading-relaxed">Bank-level security with trusted payment gateways, escrow protection, and transparent pricing.</p>
          </div>
        </div>
      </div>

      {/* Additional Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-100 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h4 className="font-bold text-gray-800 mb-2">Verified Profiles</h4>
          <p className="text-gray-600 text-sm">All providers are verified for quality and authenticity</p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-cyan-100 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <h4 className="font-bold text-gray-800 mb-2">24/7 Support</h4>
          <p className="text-gray-600 text-sm">Round-the-clock customer support for all users</p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-100 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
          </div>
          <h4 className="font-bold text-gray-800 mb-2">Real-time Chat</h4>
          <p className="text-gray-600 text-sm">Instant messaging between clients and providers</p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-pink-100 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </div>
          <h4 className="font-bold text-gray-800 mb-2">Portfolio Showcase</h4>
          <p className="text-gray-600 text-sm">Beautiful galleries to showcase your best work</p>
        </div>
      </div>
    </div>
  </section>
);

export default Features;
