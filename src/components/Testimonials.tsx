import React from 'react';

const Testimonials = () => (
  <section className="py-16">
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-4xl font-extrabold text-pink-700 text-center mb-12">What Our Users Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-pink-400 flex flex-col justify-between h-full animate-fadein">
          <div className="flex items-center gap-3 mb-4">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Influencer" className="w-10 h-10 rounded-full border-2 border-pink-200" />
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">Influencer</span>
          </div>
          <p className="text-lg italic mb-4 text-gray-700">“OneFame made it so easy to find the perfect photographer for my brand!”</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-pink-400 flex flex-col justify-between h-full animate-fadein">
          <div className="flex items-center gap-3 mb-4">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Service Provider" className="w-10 h-10 rounded-full border-2 border-pink-200" />
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">Service Provider</span>
          </div>
          <p className="text-lg italic mb-4 text-gray-700">“I’ve grown my business and connected with amazing clients.”</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-pink-400 flex flex-col justify-between h-full animate-fadein">
          <div className="flex items-center gap-3 mb-4">
            <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Influencer" className="w-10 h-10 rounded-full border-2 border-pink-200" />
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">Influencer</span>
          </div>
          <p className="text-lg italic mb-4 text-gray-700">“The booking process is seamless and the support team is fantastic!”</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-pink-400 flex flex-col justify-between h-full animate-fadein">
          <div className="flex items-center gap-3 mb-4">
            <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Service Provider" className="w-10 h-10 rounded-full border-2 border-pink-200" />
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">Service Provider</span>
          </div>
          <p className="text-lg italic mb-4 text-gray-700">“Payments are secure and I always get paid on time.”</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-pink-400 flex flex-col justify-between h-full animate-fadein">
          <div className="flex items-center gap-3 mb-4">
            <img src="https://randomuser.me/api/portraits/women/22.jpg" alt="Influencer" className="w-10 h-10 rounded-full border-2 border-pink-200" />
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">Influencer</span>
          </div>
          <p className="text-lg italic mb-4 text-gray-700">“I love the review system, it helps me choose the best providers.”</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-pink-400 flex flex-col justify-between h-full animate-fadein">
          <div className="flex items-center gap-3 mb-4">
            <img src="https://randomuser.me/api/portraits/men/12.jpg" alt="Service Provider" className="w-10 h-10 rounded-full border-2 border-pink-200" />
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">Service Provider</span>
          </div>
          <p className="text-lg italic mb-4 text-gray-700">“The calendar feature makes managing my schedule so easy.”</p>
        </div>
      </div>
    </div>
  </section>
);

export default Testimonials;
