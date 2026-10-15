import Link from "next/link";

export default function ExploreGateway() {
  const hubs = [
    {
      title: "2026 Race Calendar",
      subtitle: "24-Round Schedule",
      desc: "Full session dates, local start times, sprint weekend formats, and circuit information for every Grand Prix.",
      href: "/schedule",
      badge: "Calendar",
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Race Results Archive",
      subtitle: "Podiums & Classifications",
      desc: "Detailed race outcomes, winning margins, point payouts, and driver finishing positions across the season.",
      href: "/results",
      badge: "Archive",
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: "Paddock Lexicon",
      subtitle: "Technical & Sporting Rules",
      desc: "Comprehensive guide to F1 terminology: DRS zones, undercut tactics, tire compounds, and penalty guidelines.",
      href: "/explore/lexicon",
      badge: "Knowledge",
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "Paddock Wire News",
      subtitle: "Headlines & Analysis",
      desc: "Curated technical updates, driver transfer insights, and post-race reactions from premier motorsport outlets.",
      href: "/explore/news",
      badge: "Media",
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 font-sans">
      <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4 mb-8">
        <div className="h-7 w-1 bg-red-600 rounded-full" />
        <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tighter">
          Explore <span className="text-red-600">The Paddock</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hubs.map((hub, idx) => (
          <Link
            key={idx}
            href={hub.href}
            className="group flex flex-col justify-between p-5 bg-zinc-900/40 hover:bg-zinc-850/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-black/50 border border-zinc-800 rounded-xl group-hover:scale-105 transition-transform">
                  {hub.icon}
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded">
                  {hub.badge}
                </span>
              </div>

              <h3 className="text-base font-black italic uppercase text-white tracking-tight group-hover:text-red-500 transition-colors">
                {hub.title}
              </h3>
              <p className="text-[11px] font-mono font-bold text-red-500/90 uppercase mt-0.5">
                {hub.subtitle}
              </p>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans line-clamp-3">
                {hub.desc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono font-bold text-zinc-400 group-hover:text-white transition-colors">
              <span>Explore Section</span>
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
