import React from "react";

const featureCards = [
  {
    title: "Smart Discovery",
    copy: "Advanced filters and AI curation pair brands with the exact creators they need.",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    title: "Instant Booking",
    copy: "Calendar syncing, reminders, and one-tap confirmations keep projects moving.",
    accent: "from-cyan-500 to-indigo-500",
  },
  {
    title: "Secure Escrow",
    copy: "Bank-grade escrow protects both sides with milestone payouts and dispute shields.",
    accent: "from-indigo-500 to-blue-600",
  },
  {
    title: "Realtime Chat",
    copy: "Threaded messaging, file drops, and voice notes built for fast approvals.",
    accent: "from-purple-500 to-blue-500",
  },
];

const micro = [
  { title: "Verified ID + GST", desc: "Every creator vetted by our trust crew before going live." },
  { title: "Campaign OS", desc: "Briefs, contracts, approvals, and payouts in one workspace." },
  { title: "Revenue Insights", desc: "Track earnings, CPM, and win-rate across each platform." },
  { title: "Collab Portfolios", desc: "Immersive case studies brands can binge before booking." },
];

const Features = () => (
  <section className="py-20">
    <div className="mx-auto max-w-6xl px-4">
      <div className="rounded-[40px] bg-gradient-to-br from-[#0B1C44] via-[#0D1A3A] to-[#061023] p-10 text-white shadow-2xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Why brands stay</p>
            <h2 className="text-4xl font-black leading-tight md:text-5xl">Campaign OS for the influencer era.</h2>
            <p className="text-white/80">
              Manage discovery, chats, contracts, and payouts from one sleek dashboard. No more multi-tab chaos or missed DMs—just runway for bold work.
            </p>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Matching engine that understands niche, tone, and past performance.
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-purple-300" />
                Transparent timelines with approvals, reminders, and smart nudges.
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-300" />
                Built-in analytics to prove lift and ROI across every channel.
              </li>
            </ul>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {featureCards.map((card) => (
              <div key={card.title} className={`rounded-3xl bg-gradient-to-br ${card.accent} p-5 shadow-lg backdrop-blur`}>
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-white/85">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {micro.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-100/20 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur transition hover:-translate-y-1 hover:border-white/40"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Feature</p>
            <h4 className="mt-3 text-lg font-semibold text-white">{item.title}</h4>
            <p className="mt-2 text-sm text-white/70">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
