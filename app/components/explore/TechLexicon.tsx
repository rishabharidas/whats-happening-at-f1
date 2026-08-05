"use client";

import React, { useState } from "react";
import Link from "next/link";

interface GlossaryTerm {
  term: string;
  category: "Aerodynamics" | "Strategy" | "Regulations" | "Driving";
  definition: string;
  context: string; // F1 context example
}

const TERMS: GlossaryTerm[] = [
  {
    term: "DRS (Drag Reduction System)",
    category: "Aerodynamics",
    definition: "An adjustable flap on the rear wing of the car that opens to reduce aerodynamic drag, increasing straight-line speed by up to 10-12 km/h.",
    context: "Can only be activated when a driver is within 1 second of the car ahead inside designated DRS zones.",
  },
  {
    term: "Undercut",
    category: "Strategy",
    definition: "A pit stop strategy where a trailing driver pits early for fresh tyres, attempting to lay down fast out-laps to leapfrog a competitor ahead when they eventually pit.",
    context: "Highly effective on tracks with high tyre wear where new rubber provides a massive performance gain.",
  },
  {
    term: "Overcut",
    category: "Strategy",
    definition: "A pit stop strategy where a driver stays out longer than the car ahead, hoping clean air and light fuel allow them to set fast laps while the opponent warms up cold tyres.",
    context: "Most effective on street circuits with low tyre wear (like Monaco) where tyre warm-up is slow.",
  },
  {
    term: "Dirty Air",
    category: "Aerodynamics",
    definition: "The turbulent, low-pressure wake left behind by a leading F1 car. Following cars suffer a massive loss of downforce, making it harder to corner close behind.",
    context: "The 2022 ground-effect regulations were specifically designed to minimize dirty air and improve close racing.",
  },
  {
    term: "Parc Fermé",
    category: "Regulations",
    definition: "A secure area where cars are held post-qualifying until the race start. Teams are prohibited from making major setup adjustments (except wing angles or tyre swaps).",
    context: "Violations of Parc Fermé conditions require starting the race from the pit lane.",
  },
  {
    term: "Apex",
    category: "Driving",
    definition: "The geometric or tactical center point of a corner. It is the tightest part of the turn where the driver transitions from braking to acceleration.",
    context: "Missing the apex ruins the corner exit speed, leaving the driver vulnerable down the subsequent straight.",
  },
  {
    term: "Slipstream",
    category: "Aerodynamics",
    definition: "The pocket of low air resistance created behind a high-speed car. A following car can use this draft to achieve higher straight-line speeds for overtaking.",
    context: "Particularly powerful on long straights like Monza or Spa-Francorchamps.",
  },
  {
    term: "Flat Spot",
    category: "Driving",
    definition: "Damage caused to a tyre when a driver locks their brakes, causing the tyre to slide along the asphalt. This wears away a flat section, causing severe vibration.",
    context: "Flat spots require pitting early as the vibrations can damage the suspension or block driver visibility."
  },
  {
    term: "Manual Override Mode (MOM)",
    category: "Regulations",
    definition: "A 2026 power unit feature that provides chasing drivers with a battery boost (up to 350kW) at high speeds to assist overtaking, augmenting active aero configurations.",
    context: "Replaces traditional DRS in certain wheel-to-wheel overtaking scenarios under the 2026 engine rules.",
  },
  {
    term: "Active Aerodynamics (Z-Mode & X-Mode)",
    category: "Aerodynamics",
    definition: "A 2026 technical rule introducing movable front and rear wings: Z-Mode (high-downforce wing angle for cornering) and X-Mode (low-drag flat angle for straight-line speed).",
    context: "Drivers can toggle or automatically trigger wing angle changes between corner entry and straight lines.",
  },
  {
    term: "50/50 Power Unit Split",
    category: "Regulations",
    definition: "The 2026 power unit overhaul splitting power delivery equally (approx. 50% each) between the internal combustion engine (ICE) and the hybrid electric MGU-K battery unit.",
    context: "Increases electrical energy output from 120kW to 350kW, while completely removing the complex MGU-H.",
  },
  {
    term: "Agile Car Concept",
    category: "Regulations",
    definition: "A 2026 structural design overhaul reducing F1 car dimensions (wheelbase shortened to 3.4m, width narrowed to 1.9m, total weight reduced by 30kg) to improve overtaking agility.",
    context: "A direct design pivot to solve complaints that modern hybrid cars had become too large and heavy.",
  },
  {
    term: "100% Sustainable Fuel",
    category: "Regulations",
    definition: "A 2026 mandate requiring all power units to run on fully certified, synthetic e-fuels or advanced biofuels with zero net greenhouse gas impact.",
    context: "Designed to showcase hybrid green technology as part of F1's goal to be Net Zero Carbon by 2030."
  }
];

export default function TechLexicon({ isPreview = false }: { isPreview?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const termsToDisplay = isPreview ? TERMS.slice(0, 4) : TERMS;

  const filteredTerms = termsToDisplay.filter((t) => {
    if (isPreview) return true;
    const matchesSearch = t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 w-full pt-8 border-t border-zinc-900/40">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-red-600" />
          <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">
            Paddock <span className="text-red-600">Tech Lexicon</span>
          </h3>
        </div>
        {isPreview && (
          <Link
            href="/explore/lexicon"
            className="group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase italic tracking-widest bg-zinc-900 border border-zinc-700 text-zinc-355 hover:border-red-650 hover:text-white transition-all rounded-full"
          >
            <span>Full Lexicon</span>
            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        )}
      </div>

      {/* SEARCH & FILTERS BAR */}
      {!isPreview && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search F1 glossary terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-650 transition-colors"
          />
          <svg
            className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 pr-1">
          {["All", "Aerodynamics", "Strategy", "Regulations", "Driving"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${
                  selectedCategory === cat
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "bg-zinc-900/60 text-zinc-400 border border-zinc-850 hover:text-white"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      )}      {/* TERMS GRID */}
      {filteredTerms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
          {filteredTerms.map((term, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-zinc-900/20 border border-zinc-850 p-5 rounded-2xl hover:border-zinc-750 hover:bg-zinc-900/30 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Category Badge */}
              <div className="absolute top-4 right-4 text-[8px] font-black uppercase px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 tracking-wider">
                {term.category}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <h4 className="font-bold text-white uppercase text-sm tracking-tight group-hover:text-red-500 transition-colors">
                  {term.term}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-sans font-medium">
                  {term.definition}
                </p>
                <div className="mt-3 pt-3 border-t border-zinc-900/60">
                  <span className="text-[9px] text-zinc-550 font-black uppercase tracking-wider font-mono">
                    Race Context:
                  </span>
                  <p className="text-[10px] text-zinc-450 italic mt-0.5 leading-normal">
                    {term.context}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-zinc-650 uppercase font-mono text-xs tracking-widest border border-dashed border-zinc-850 rounded-2xl w-full">
          No matching lexicon terms found
        </div>
      )}

      {/* VIEW ALL BUTTON (only if isPreview) */}
      {isPreview && (
        <div className="flex justify-center mt-4">
          <Link
            href="/explore/lexicon"
            className="group relative inline-flex px-8 py-4 bg-zinc-950/80 border border-zinc-800 text-white font-bold uppercase italic tracking-wider transition-all hover:bg-red-600 hover:border-red-650"
          >
            <span className="relative z-10 flex items-center gap-2">
              Browse Full Tech Lexicon
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-600 group-hover:bg-white transition-colors" />
          </Link>
        </div>
      )}
    </div>
  );
}
