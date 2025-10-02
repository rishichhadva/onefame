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
    <section className="py-16 max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold text-pink-700 text-center mb-10">FAQs</h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md">
            <button
              className="w-full text-left px-6 py-4 font-bold text-pink-600 focus:outline-none flex justify-between items-center"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              {faq.question}
              <span className="ml-2">{open === idx ? '−' : '+'}</span>
            </button>
            {open === idx && (
              <div className="px-6 pb-4 text-gray-700 text-base animate-fadein">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQs;
