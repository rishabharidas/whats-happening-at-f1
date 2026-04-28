export default function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-800 bg-[#0a0a0a] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600 skew-x-[-20deg]" />
              <span className="text-xl font-black italic tracking-tighter text-white uppercase">
                WHATS<span className="text-red-600 text-2xl">HAPPENING</span>@F1
              </span>
            </div>
            <p className="text-zinc-500 text-sm max-w-70 leading-relaxed">
              Your ultimate destination for real-time Formula 1 data, race results, and championship standings.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 md:justify-center">
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Racing</h4>
              <a href="#last-race-results" className="text-zinc-500 hover:text-red-500 text-sm transition-colors uppercase font-medium">Results</a>
              <a href="#upcoming-session" className="text-zinc-500 hover:text-red-500 text-sm transition-colors uppercase font-medium">Schedule</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Rankings</h4>
              <a href="#drivers-standings" className="text-zinc-500 hover:text-red-500 text-sm transition-colors uppercase font-medium">Drivers</a>
              <a href="#constructors-standings" className="text-zinc-500 hover:text-red-500 text-sm transition-colors uppercase font-medium">Teams</a>
            </div>
          </div>

          {/* Contact/Newsletter Placeholder */}
          <div className="flex flex-col items-start md:items-end gap-4">
             <div className="flex gap-4">
                {/* Social Placeholders */}
                {['Twitter', 'Instagram', 'GitHub'].map((social) => (
                   <div key={social} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer hover:border-red-600 transition-colors">
                      <div className="w-3 h-3 bg-zinc-600 rounded-sm" />
                   </div>
                ))}
             </div>
             <p className="text-zinc-600 text-xs text-start md:text-right">
                Data provided via OpenF1 API.<br/>
                Not affiliated with Formula 1.
             </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} WHATS HAPPENING @ F1
          </span>
          <div className="flex gap-6">
             <span className="text-zinc-700 text-[10px] uppercase font-black italic">Speed</span>
             <span className="text-zinc-700 text-[10px] uppercase font-black italic">Precision</span>
             <span className="text-zinc-700 text-[10px] uppercase font-black italic">Data</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
