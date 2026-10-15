import Link from "next/link";

export default function ExploreGateway() {
  const features = [
    {
      title: "Team Radios & Comms",
      subtitle: "Audio Experience",
      desc: "Stream authentic, unfiltered pit-to-car communications, dramatic team orders, and high-speed telemetry reactions.",
      href: "/explore",
      badge: "Audio Center",
      badgeColor: "text-amber-400 bg-amber-950/60 border-amber-600/40",
      accentBorder: "hover:border-amber-500/60",
      accentGlow: "group-hover:shadow-amber-500/10",
      accentText: "group-hover:text-amber-400",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      ),
    },
    {
      title: "F1 Technical Lexicon",
      subtitle: "Aero & Regulations",
      desc: "Interactive motorsport dictionary covering DRS, ground effect, undercut strategies, tire degradation, and FIA sporting rules.",
      href: "/explore/lexicon",
      badge: "Lexicon",
      badgeColor: "text-cyan-400 bg-cyan-950/60 border-cyan-600/40",
      accentBorder: "hover:border-cyan-500/60",
      accentGlow: "group-hover:shadow-cyan-500/10",
      accentText: "group-hover:text-cyan-400",
      icon: (
        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "Hall of Fame Legends",
      subtitle: "Motorsport Titans",
      desc: "Celebrate the iconic achievements, legendary rivalries, and records of Senna, Schumacher, Hamilton, Prost, and Clark.",
      href: "/explore",
      badge: "Heritage",
      badgeColor: "text-yellow-400 bg-yellow-950/60 border-yellow-600/40",
      accentBorder: "hover:border-yellow-500/60",
      accentGlow: "group-hover:shadow-yellow-500/10",
      accentText: "group-hover:text-yellow-400",
      icon: (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      title: "Paddock Wire News",
      subtitle: "Insider Feed",
      desc: "Curated technical updates, driver transfer insights, and post-race reactions from premier motorsport journalists.",
      href: "/explore/news",
      badge: "Editorial",
      badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-600/40",
      accentBorder: "hover:border-emerald-500/60",
      accentGlow: "group-hover:shadow-emerald-500/10",
      accentText: "group-hover:text-emerald-400",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 font-sans flex flex-col gap-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 bg-red-600 rounded-full" />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-zinc-400">
                DEEP DIVE // BEYOND THE TIMING SCREEN
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tighter">
              Explore <span className="text-red-600">The Paddock</span>
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm font-sans text-zinc-400 max-w-xs sm:max-w-sm leading-relaxed sm:text-right">
          Interactive encyclopedias, live radio communications, and motorsport culture.
        </p>
      </div>

      {/* FEATURED SPOTLIGHT HERO BANNER - LEADS DIRECTLY TO /explore */}
      <Link
        href="/explore"
        aria-label="Enter the F1 Paddock Explore Hub"
        className="group relative flex flex-col lg:flex-row items-stretch justify-between p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#181113] via-[#121318] to-[#0c0d12] border border-red-950/80 hover:border-red-600/70 shadow-2xl transition-all duration-300 hover:scale-[1.008] hover:shadow-red-600/10 overflow-hidden"
      >
        {/* Glow ambient circle */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-red-600/25 transition-colors"
        />

        {/* Left: Content description */}
        <div className="relative z-10 flex flex-col justify-between gap-6 max-w-2xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-red-400 bg-red-950/60 border border-red-800/50 px-2.5 py-0.5 rounded-full">
                Interactive Experience Hub
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">
              Step Inside the <span className="text-red-500">Paddock Hub</span>
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed mt-1">
              Go behind closed garage doors. Listen to authentic team radio broadcasts,
              master aerodynamic and strategic jargon in our F1 technical lexicon, and
              explore the achievements of motorsport legends in the Hall of Fame.
            </p>
          </div>

          {/* Quick pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] font-mono font-bold text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>📻</span> Team Radios
            </span>
            <span className="text-[11px] font-mono font-bold text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>📖</span> Tech Lexicon
            </span>
            <span className="text-[11px] font-mono font-bold text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>🏆</span> Hall of Fame
            </span>
            <span className="text-[11px] font-mono font-bold text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>📰</span> Paddock Wire
            </span>
          </div>
        </div>

        {/* Right: Action CTA button & preview badge */}
        <div className="relative z-10 mt-6 lg:mt-0 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-800/80 pt-4 lg:pt-0 lg:pl-8">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
              Destination URL
            </span>
            <span className="text-xs font-mono font-bold text-zinc-300">
              /explore
            </span>
          </div>

          <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-red-600 group-hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 group-hover:translate-x-1">
            <span>Enter Paddock Hub</span>
            <span className="text-sm" aria-hidden="true">&rarr;</span>
          </div>
        </div>
      </Link>

      {/* 4 FEATURE PILLAR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, idx) => (
          <Link
            key={idx}
            href={feature.href}
            className={`group flex flex-col justify-between p-5 bg-[#121318] hover:bg-[#161820] border border-white/10 ${feature.accentBorder} rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg ${feature.accentGlow}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-black/60 border border-white/10 rounded-xl group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${feature.badgeColor}`}>
                  {feature.badge}
                </span>
              </div>

              <h3 className={`text-base font-black italic uppercase tracking-tight text-white ${feature.accentText} transition-colors`}>
                {feature.title}
              </h3>
              <p className="text-[11px] font-mono font-bold text-zinc-400 uppercase mt-0.5">
                {feature.subtitle}
              </p>
              <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed font-sans line-clamp-3">
                {feature.desc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-zinc-400 group-hover:text-white transition-colors">
              <span>Explore Feature</span>
              <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">
                &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
