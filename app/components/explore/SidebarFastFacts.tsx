import React from "react";

const PADDOCK_FAST_FACTS = [
  {
    number: "7",
    title: "World Championships",
    holder: "Lewis Hamilton & Michael Schumacher",
    desc: "The absolute record for the most driver championship titles in Formula 1 history.",
    color: "from-red-600 to-orange-500",
  },
  {
    number: "105",
    title: "Grand Prix Wins",
    holder: "Lewis Hamilton",
    desc: "The record holder for the highest number of individual race victories.",
    color: "from-blue-600 to-indigo-500",
  },
  {
    number: "18y",
    title: "Youngest Race Winner",
    holder: "Max Verstappen (GP Spain 2016)",
    desc: "Stunned the motorsport world by winning on his Red Bull debut at just 18 years, 228 days.",
    color: "from-yellow-500 to-amber-600",
  },
  {
    number: "1:18.8",
    title: "Fastest Ever Lap (Monza)",
    holder: "Lewis Hamilton (2020)",
    desc: "Recorded at an average speed of 264.362 km/h (164.267 mph) during qualifying.",
    color: "from-emerald-500 to-teal-600",
  },
];

export default function SidebarFastFacts() {
  return (
    <div className="lg:col-span-1 flex flex-col gap-6 w-full lg:sticky lg:top-8">
      <div className="border border-zinc-800 bg-zinc-950/60 p-6 rounded-2xl relative overflow-hidden flex flex-col gap-4">
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />

        <h3 className="text-lg font-black italic uppercase text-white tracking-tight flex items-center gap-2 border-b border-zinc-800 pb-3">
          <span className="h-4 w-1 bg-red-600" />
          Paddock Fast Facts
        </h3>

        <div className="flex flex-col gap-4">
          {PADDOCK_FAST_FACTS.map((fact, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl relative group overflow-hidden transition-all hover:border-zinc-800"
            >
              <span
                className={`text-3xl font-black italic tracking-tighter bg-gradient-to-r ${fact.color} bg-clip-text text-transparent`}
              >
                {fact.number}
              </span>
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-tight mt-1">
                {fact.title}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 italic">
                {fact.holder}
              </span>
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {fact.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
