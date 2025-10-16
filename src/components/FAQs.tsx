import React, { useState } from 'react';

const faqs = [
  {
    question: 'How do I sign up as an influencer or provider?',
    answer: 'Click Sign Up and select your role. Fill in your details and start using OneFame instantly.'
  },
  {
    question: 'Is payment secure on OneFame?',
    answer: 'Yes, all payments are processed securely using trusted gateways.'
  },
  {
    question: 'Can I change my role after signing up?',
    answer: 'You can contact support to request a role change if needed.'
  },
  {
    question: 'How do I leave a review?',
    answer: 'After a booking is completed, you can leave a review from your dashboard.'
  },
  {
    question: 'Is there customer support?',
    answer: 'Yes, our support team is available 24/7 via chat and email.'
  }
];

const FAQs = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">Frequently Asked Questions</h2>
        <p className="text-xl text-gray-600">Everything you need to know about OneFame</p>
      </div>
      
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <button
              className="w-full text-left px-8 py-6 font-bold text-gray-800 focus:outline-none flex justify-between items-center hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              <span className="text-lg">{faq.question}</span>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl transition-transform duration-300 ${open === idx ? 'rotate-45' : ''}`}>
                +
              </div>
            </button>
            {open === idx && (
              <div className="px-8 pb-6 text-gray-700 text-lg leading-relaxed bg-gradient-to-r from-blue-50/50 to-cyan-50/50 animate-fadein">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Contact Support Section */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
        <p className="text-blue-100 mb-6 text-lg">Our support team is here to help you 24/7</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-white text-blue-600 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            Contact Support
          </button>
          <button className="px-8 py-3 border-2 border-white/50 text-white rounded-2xl font-bold hover:bg-white/10 transition-all duration-300">
            View Help Center
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQs;
