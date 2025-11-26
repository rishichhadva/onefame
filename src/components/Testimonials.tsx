import React from 'react';

const Testimonials = () => (
  <section className="py-20 text-white">
    <div className="mx-auto max-w-6xl px-4">
      <div className="mb-16 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Testimonials</p>
        <h2 className="mt-3 text-4xl font-black">What our users say</h2>
        <p className="text-white/60">Real drops from creators and providers who found success on OneFame.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/30 transition hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-6">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah Chen" className="w-16 h-16 rounded-full border-4 border-blue-200 shadow-lg" />
            <div>
              <h4 className="text-lg font-semibold">Sarah Chen</h4>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70">Influencer</span>
            </div>
          </div>
          <p className="mb-4 text-white/75">“OneFame made it so easy to find the perfect photographer for my brand shoots.”</p>
          <div className="flex text-amber-300">
            {Array.from({ length: 5 }).map((_, idx) => (
              <svg key={idx} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/30 transition hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-6">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Marcus Rivera" className="w-16 h-16 rounded-full border-4 border-cyan-200 shadow-lg" />
            <div>
              <h4 className="text-lg font-semibold">Marcus Rivera</h4>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70">Provider</span>
            </div>
          </div>
          <p className="mb-4 text-white/75">“I've grown my business exponentially and connected with amazing clients through OneFame.”</p>
          <div className="flex text-amber-300">
            {Array.from({ length: 5 }).map((_, idx) => (
              <svg key={idx} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/30 transition hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-6">
            <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Emma Wilson" className="w-16 h-16 rounded-full border-4 border-indigo-200 shadow-lg" />
            <div>
              <h4 className="text-lg font-semibold">Emma Wilson</h4>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70">Influencer</span>
            </div>
          </div>
          <p className="mb-4 text-white/75">“The booking process is seamless and the support team is absolutely fantastic.”</p>
          <div className="flex text-amber-300">
            {Array.from({ length: 5 }).map((_, idx) => (
              <svg key={idx} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Testimonials;
