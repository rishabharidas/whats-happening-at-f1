import React from "react";

export default function PaddockAudioCenter() {
  return (
    <div className="border border-zinc-800 bg-zinc-950/60 p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col gap-6 w-full mt-6">
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
        <div className="h-8 w-1 bg-red-600" />
        <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">
          Paddock <span className="text-red-600">Audio Center</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch w-full">
        {/* Spotify Podcast Embed (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] font-mono">
            Beyond The Grid Podcast Player
          </span>
          <iframe
            style={{ borderRadius: "16px" }}
            src="https://open.spotify.com/embed/show/4NGpuDYjOYyVzH6OqZXtCF?utm_source=generator&theme=0"
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen={false}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>

        {/* Curated Channels & Links (1/3 width) */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] font-mono">
              Official Channels
            </span>
            
            <div className="flex flex-col gap-2.5 max-h-[352px] overflow-y-auto pr-1 custom-scrollbar">
              {[
                {
                  name: "Beyond The Grid (Spotify)",
                  desc: "Open the official podcast show directly on your Spotify app.",
                  url: "https://open.spotify.com/show/4NGpuDYjOYyVzH6OqZXtCF",
                  badge: "Spotify",
                },
                {
                  name: "F1 Official YouTube",
                  desc: "Race highlights, exclusive driver interviews, and technical analysis.",
                  url: "https://www.youtube.com/user/Formula1",
                  badge: "Channel",
                },
                {
                  name: "Beyond The Grid Audio",
                  desc: "Audioboom and alternate feed broadcasts.",
                  url: "https://audioboom.com/channel/beyond-the-grid",
                  badge: "Audio",
                },
                {
                  name: "F1 TV Official",
                  desc: "Live race broadcasts, cockpit feeds, and historic race archives.",
                  url: "https://f1tv.formula1.com",
                  badge: "F1 TV",
                },
              ].map((chan) => (
                <a
                  key={chan.name}
                  href={chan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-850 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all duration-300"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase text-xs tracking-tight group-hover:text-red-500 transition-colors">
                        {chan.name}
                      </span>
                      <span className="px-1.5 py-0.5 text-[8px] font-black uppercase bg-zinc-800 text-zinc-400 rounded tracking-wider">
                        {chan.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-455 mt-0.5 leading-normal font-sans">
                      {chan.desc}
                    </p>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-zinc-655 group-hover:text-white transition-colors self-center flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Podcast Disclaimer */}
          <div className="p-3 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
            <p className="text-[9px] text-zinc-655 leading-relaxed font-mono">
              * Note: Embedded audio playback is provided by Spotify. Full episodes require a Spotify account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
