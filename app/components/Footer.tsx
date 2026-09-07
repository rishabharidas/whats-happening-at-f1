import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-800 bg-[#0a0a0a] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-6 h-6 bg-red-600 skew-x-[-20deg] group-hover:bg-red-500 transition-colors" />
              <span className="text-xl font-black italic tracking-tighter text-white uppercase">
                WHATS<span className="text-red-600 text-2xl">HAPPENING</span>@F1
              </span>
            </Link>
            <p className="text-zinc-500 text-sm max-w-70 leading-relaxed">
              Your high-performance dashboard for real-time Formula 1 session
              results, race calendars, and championship standings.
            </p>
          </div>

          {/* Quick Links (Curated Essential 4) */}
          <div className="grid grid-cols-2 gap-8 md:justify-center">
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1">
                Racing
              </h4>
              <Link
                href="/schedule"
                className="text-zinc-400 hover:text-white hover:translate-x-0.5 transition-all text-sm uppercase font-medium"
              >
                Schedule
              </Link>
              <Link
                href="/results"
                className="text-zinc-400 hover:text-white hover:translate-x-0.5 transition-all text-sm uppercase font-medium"
              >
                Results
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1">
                Overview
              </h4>
              <Link
                href="/#drivers-standings"
                className="text-zinc-400 hover:text-white hover:translate-x-0.5 transition-all text-sm uppercase font-medium"
              >
                Standings
              </Link>
              <Link
                href="/explore/news"
                className="text-zinc-400 hover:text-white hover:translate-x-0.5 transition-all text-sm uppercase font-medium"
              >
                Paddock News
              </Link>
            </div>
          </div>

          {/* Attribution & Socials */}
          <div className="flex flex-col items-start md:items-end gap-4">
            <div className="flex gap-4">
              {["Twitter", "Instagram", "GitHub"].map((social) => (
                <div
                  key={social}
                  aria-label={social}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer hover:border-red-600 transition-colors"
                >
                  <div className="w-3 h-3 bg-zinc-600 rounded-sm" />
                </div>
              ))}
            </div>
            <p className="text-zinc-600 text-xs text-start md:text-right">
              Powered by Jolpica F1 & OpenF1 API.
              <br />
              Unofficial fan application.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} WHATS HAPPENING @ F1
          </span>
          <div className="flex gap-6">
            <span className="text-zinc-700 text-[10px] uppercase font-black italic">
              Speed
            </span>
            <span className="text-zinc-700 text-[10px] uppercase font-black italic">
              Precision
            </span>
            <span className="text-zinc-700 text-[10px] uppercase font-black italic">
              Data
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
