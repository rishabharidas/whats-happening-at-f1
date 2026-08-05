"use client";

import React, { useState } from "react";

interface Circuit {
  id: string;
  name: string;
  location: string;
  length: string;
  corners: number;
  drsZones: number;
  lapRecord: string;
  lapRecordHolder: string;
  description: string;
  svgPath: string; // SVG path mockup to show outline
}

const CIRCUITS: Circuit[] = [
  {
    id: "spa",
    name: "Spa-Francorchamps",
    location: "Stavelot, Belgium",
    length: "7.004 km",
    corners: 19,
    drsZones: 2,
    lapRecord: "1:46.286",
    lapRecordHolder: "Valtteri Bottas (2018)",
    description: "Nestled in the Ardennes forest, Spa is a driver favorite. It features legendary fast corners like Eau Rouge and Raidillon, offering massive elevation changes and extreme speed.",
    svgPath: "M10,40 L35,25 L55,30 L60,15 L75,10 L90,20 L85,45 L75,55 L80,75 L60,85 L40,80 L25,60 Z"
  },
  {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    location: "Monza, Italy",
    length: "5.793 km",
    corners: 11,
    drsZones: 2,
    lapRecord: "1:21.046",
    lapRecordHolder: "Rubens Barrichello (2004)",
    description: "Known as the 'Temple of Speed', Monza is the fastest track on the calendar. Teams run ultra-low downforce setups to fly down its long straights before braking hard for tight chicanes.",
    svgPath: "M10,50 L40,30 L90,30 L85,70 L45,70 L20,65 Z"
  },
  {
    id: "monaco",
    name: "Circuit de Monaco",
    location: "Monte Carlo, Monaco",
    length: "3.337 km",
    corners: 19,
    drsZones: 1,
    lapRecord: "1:12.909",
    lapRecordHolder: "Lewis Hamilton (2021)",
    description: "The ultimate test of precision. Narrow streets, tight barriers, and no margin for error. Monaco is the crown jewel of the F1 calendar where qualifying is almost everything.",
    svgPath: "M10,25 L30,15 L50,20 L65,15 L80,25 L85,45 L65,55 L55,45 L40,55 L25,45 Z"
  },
  {
    id: "silverstone",
    name: "Silverstone Circuit",
    location: "Silverstone, United Kingdom",
    length: "5.891 km",
    corners: 18,
    drsZones: 2,
    lapRecord: "1:27.097",
    lapRecordHolder: "Max Verstappen (2020)",
    description: "The birthplace of Formula 1. Silverstone is a ultra-fast, flowing track that tests aerodynamic efficiency through legendary corners like Copse, Maggots, and Becketts.",
    svgPath: "M20,20 L40,10 L65,25 L85,20 L90,50 L65,80 L35,70 L15,50 Z"
  }
];

export default function CircuitGuide() {
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit>(CIRCUITS[0]);

  return (
    <div className="flex flex-col gap-6 w-full pt-8 border-t border-zinc-900/40">
      {/* SECTION HEADER */}
      <div className="flex items-center gap-4 border-b border-zinc-850 pb-4 mb-4">
        <div className="h-8 w-1 bg-red-600" />
        <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">
          Paddock <span className="text-red-600">Circuit Guide</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start w-full">
        {/* Track Selection List (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-3 w-full">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] font-mono mb-1 block">
            Select an Iconic Track
          </span>
          <div className="flex flex-col gap-2.5">
            {CIRCUITS.map((circuit) => (
              <button
                key={circuit.id}
                onClick={() => setSelectedCircuit(circuit)}
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all text-left w-full
                  ${
                    selectedCircuit.id === circuit.id
                      ? "bg-zinc-900/80 border-red-600 shadow-lg shadow-red-950/20"
                      : "bg-zinc-900/20 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/40"
                  }
                `}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm uppercase tracking-tight group-hover:text-red-500 transition-colors">
                    {circuit.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {circuit.location}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform
                    ${
                      selectedCircuit.id === circuit.id
                        ? "text-red-500 translate-x-1"
                        : "text-zinc-650 group-hover:text-white group-hover:translate-x-0.5"
                    }
                  `}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Circuit Details Panel (3 Columns) */}
        <div className="lg:col-span-3 border border-zinc-850 bg-zinc-950/50 p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center w-full min-h-[340px]">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />

          {/* Visual Track Map Outline (Left) */}
          <div className="w-40 h-40 flex-shrink-0 flex items-center justify-center bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 relative group">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-zinc-600 group-hover:text-red-500 transition-colors duration-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={selectedCircuit.svgPath} />
            </svg>
            <span className="absolute bottom-2 text-[8px] text-zinc-600 font-mono uppercase tracking-widest pointer-events-none">
              Track Outline
            </span>
          </div>

          {/* Details Content (Right) */}
          <div className="flex-1 flex flex-col gap-4 w-full">
            <div>
              <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-red-600/90 text-white rounded tracking-wider">
                {selectedCircuit.location}
              </span>
              <h4 className="text-2xl font-black italic uppercase text-white tracking-tighter mt-1">
                {selectedCircuit.name}
              </h4>
            </div>

            <p className="text-xs text-zinc-400 font-medium leading-relaxed font-sans">
              {selectedCircuit.description}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-900">
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-mono">
                  Track Length
                </span>
                <span className="text-sm font-bold text-white uppercase font-mono">
                  {selectedCircuit.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-555 uppercase tracking-widest font-mono">
                  Corners count
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {selectedCircuit.corners}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-555 uppercase tracking-widest font-mono">
                  DRS Zones
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {selectedCircuit.drsZones}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-555 uppercase tracking-widest font-mono">
                  Lap Record
                </span>
                <span className="text-[11px] font-bold text-red-500 font-mono truncate leading-normal">
                  {selectedCircuit.lapRecord}
                  <span className="block text-[8px] text-zinc-500 font-normal truncate mt-0.5">
                    {selectedCircuit.lapRecordHolder}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
