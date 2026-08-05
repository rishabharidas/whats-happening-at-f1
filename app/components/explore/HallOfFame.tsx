"use client";

import React, { useState } from "react";

interface Legend {
  name: string;
  yearsActive: string;
  championships: number;
  wins: number;
  podiums: number;
  poles: number;
  highlight: string;
  quote: string;
  description: string;
  bgGlow: string; // Tailwind glow class
}

const LEGENDS: Legend[] = [
  {
    name: "Ayrton Senna",
    yearsActive: "1984 - 1994",
    championships: 3,
    wins: 41,
    podiums: 80,
    poles: 65,
    highlight: "Legendary rivalries and unmatched wet-weather mastery.",
    quote: "If you no longer go for a gap that exists, you are no longer a racing driver.",
    description: "Famous for his intense rivalry with Alain Prost, Senna is widely regarded as the most passionate and rawest racing talent to ever command an F1 cockpit. His qualifying laps and wet-weather driving remain the gold standard.",
    bgGlow: "from-yellow-600/10 to-green-600/10",
  },
  {
    name: "Michael Schumacher",
    yearsActive: "1991 - 2012",
    championships: 7,
    wins: 91,
    podiums: 155,
    poles: 68,
    highlight: "Dominated the early 2000s, returning Ferrari to glory.",
    quote: "I've always believed that you should never, ever give up and you should always keep fighting.",
    description: "The 'Red Baron'. Schumacher raised the bar for physical fitness and analytical feedback in F1. Alongside Jean Todt and Ross Brawn, he built a Ferrari dynasty that claimed five consecutive double championships.",
    bgGlow: "from-red-600/10 to-zinc-800/10",
  },
  {
    name: "Niki Lauda",
    yearsActive: "1971 - 1985",
    championships: 3,
    wins: 25,
    podiums: 54,
    poles: 24,
    highlight: "Surviving Nürburgring 1976 and winning championships with Ferrari and McLaren.",
    quote: "A wise man gets more use from his enemies than a fool from his friends.",
    description: "Lauda was defined by his precision, intelligence, and unbelievable resilience. After a near-fatal crash at the Nürburgring in 1976, he returned to the cockpit just 40 days later, showing unmatched mental strength.",
    bgGlow: "from-red-600/10 to-orange-500/10",
  },
  {
    name: "Jim Clark",
    yearsActive: "1960 - 1968",
    championships: 2,
    wins: 25,
    podiums: 32,
    poles: 33,
    highlight: "Winning the Indy 500 and F1 Championship in the same year (1965).",
    quote: "I only ever raced to win, but safety was always in the back of my mind.",
    description: "A legendary figure of F1's golden era. Clark was a quiet, modest driver of incredible natural capability. He won his two titles driving for Lotus, conquering multiple motorsport categories simultaneously.",
    bgGlow: "from-green-600/10 to-yellow-600/10",
  }
];

export default function HallOfFame() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6 w-full pt-8 border-t border-zinc-900/40">
      {/* SECTION HEADER */}
      <div className="flex items-center gap-4 border-b border-zinc-850 pb-4 mb-4">
        <div className="h-8 w-1 bg-red-600" />
        <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">
          Paddock <span className="text-red-600">Hall of Fame</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
        {LEGENDS.map((legend, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`flex flex-col justify-between bg-zinc-900/20 border p-6 md:p-8 rounded-3xl relative overflow-hidden transition-all duration-500 min-h-[400px]
              ${
                hoveredIdx === idx
                  ? "border-zinc-700 shadow-2xl scale-[1.01]"
                  : "border-zinc-850"
              }
            `}
          >
            {/* Background ambient gradient glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${legend.bgGlow} opacity-60 pointer-events-none`} />

            {/* Vintage style watermark background */}
            <div className="absolute right-4 top-4 text-7xl md:text-8xl font-black italic text-zinc-900/30 pointer-events-none font-sans uppercase">
              LEGEND
            </div>

            {/* Info header */}
            <div className="relative z-10">
              <span className="text-[10px] text-red-500 font-black uppercase tracking-widest font-mono">
                {legend.yearsActive}
              </span>
              <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter mt-1">
                {legend.name}
              </h4>
              <p className="text-[11px] text-zinc-400 font-semibold italic mt-2 border-l-2 border-red-650 pl-3">
                {"\""}{legend.quote}{"\""}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-450 mt-4 leading-relaxed font-sans relative z-10 font-medium">
              {legend.description}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-zinc-900 mt-6 relative z-10">
              <div className="flex flex-col">
                <span className="text-[8px] text-zinc-555 uppercase tracking-widest font-mono">
                  Titles
                </span>
                <span className="text-lg font-black text-white font-mono">
                  {legend.championships}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-zinc-555 uppercase tracking-widest font-mono">
                  Wins
                </span>
                <span className="text-lg font-black text-white font-mono">
                  {legend.wins}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-zinc-555 uppercase tracking-widest font-mono">
                  Podiums
                </span>
                <span className="text-lg font-black text-white font-mono">
                  {legend.podiums}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-zinc-555 uppercase tracking-widest font-mono">
                  Poles
                </span>
                <span className="text-lg font-black text-red-500 font-mono">
                  {legend.poles}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
