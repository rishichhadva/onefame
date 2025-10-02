import React from 'react';
import { messages } from '../../data/sampleData';

const ChatPage = () => (
  <div className="min-h-screen bg-pink-50 p-8 relative">
    <a href="/" className="absolute top-6 left-6 text-pink-600 hover:text-pink-800">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </a>
    <h1 className="text-4xl font-extrabold text-pink-700 mb-10 text-center">Messaging & Chat</h1>
    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-pink-600 mb-6">Messages</h2>
      <div className="space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === 'Influencer User' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs px-6 py-4 rounded-2xl ${msg.from === 'Influencer User' ? 'bg-pink-100 text-pink-700' : 'bg-pink-600 text-white'} shadow-lg`}>
              <div className="text-sm font-bold mb-1">{msg.from}</div>
              <div className="text-base mb-1">{msg.text}</div>
              <div className="text-xs text-gray-400 mt-1">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto mb-8">
      <h2 className="text-2xl font-bold text-pink-600 mb-4">Notifications</h2>
      <div className="text-gray-700">No new notifications.</div>
    </div>
  </div>
);

export default ChatPage;
