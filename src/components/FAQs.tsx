import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="mx-auto max-w-4xl py-20 text-white">
      <div className="mb-16 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Support</p>
        <h2 className="mt-3 text-4xl font-black">Frequently asked questions</h2>
        <p className="text-white/60">Everything you need to know about OneFame.</p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-white shadow-lg shadow-black/30 transition hover:-translate-y-1">
            <button
              className="flex w-full items-center justify-between px-8 py-6 text-left text-lg font-semibold"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              <span className="text-lg">{faq.question}</span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl transition ${open === idx ? 'rotate-45' : ''}`}>
                +
              </div>
            </button>
            {open === idx && (
              <div className="border-t border-white/5 px-8 pb-6 text-white/70">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-600/20 via-cyan-500/20 to-blue-500/20 p-10 text-center text-white shadow-xl shadow-black/40">
        <h3 className="text-2xl font-bold">Still have questions?</h3>
        <p className="mt-3 text-white/70">Our support team is here to help you 24/7.</p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button 
            onClick={() => navigate("/contact")}
            className="rounded-2xl bg-white px-8 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-purple-900/30 transition hover:-translate-y-1"
          >
            Contact Support
          </button>
          <button 
            onClick={() => navigate("/help")}
            className="rounded-2xl border border-white/30 px-8 py-3 text-base font-semibold text-white hover:bg-white/10"
          >
            View Help Center
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQs;
