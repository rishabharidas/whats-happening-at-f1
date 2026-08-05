"use client";

import React, { useState } from "react";

interface DriverProfile {
  number: string;
  name: string;
  team: string;
  country: string;
  championships: number;
  podiums: number;
  wins: number;
  style: string;
  bio: string;
  color: string; // Tailored color badge
}

const DRIVERS: DriverProfile[] = [
  {
    number: "1",
    name: "Max Verstappen",
    team: "Red Bull Racing",
    country: "Netherlands",
    championships: 3,
    podiums: 107,
    wins: 61,
    style: "Aggressive, relentless tyre manager with unmatched qualifying pace.",
    bio: "The youngest ever race winner in F1 history, Verstappen has dominated the ground-effect era with Red Bull, combining raw speed with supreme racecraft.",
    color: "from-blue-600 to-red-600",
  },
  {
    number: "44",
    name: "Lewis Hamilton",
    team: "Mercedes AMG",
    country: "United Kingdom",
    championships: 7,
    podiums: 201,
    wins: 105,
    style: "Masterful wet-weather specialist with exceptional tyre-saving race pace.",
    bio: "Statistically the greatest driver of all time. Known for his legendary sportsmanship, championship pedigree, and spectacular career shift to Scuderia Ferrari.",
    color: "from-teal-500 to-zinc-700",
  },
  {
    number: "16",
    name: "Charles Leclerc",
    team: "Scuderia Ferrari",
    country: "Monaco",
    championships: 0,
    podiums: 36,
    wins: 7,
    style: "Fearless street-circuit wizard, spectacular one-lap qualifying speed.",
    bio: "Ferrari's golden boy. Combining pure talent with high-speed reflex maneuvers, Leclerc is a qualifying specialist fighting to return Ferrari to the pinnacle.",
    color: "from-red-600 to-amber-500",
  },
  {
    number: "4",
    name: "Lando Norris",
    team: "McLaren",
    country: "United Kingdom",
    championships: 0,
    podiums: 21,
    wins: 2,
    style: "Highly consistent, clean wheel-to-wheel racer with excellent race pace.",
    bio: "The poster boy of McLaren's recent resurgence. Lando Norris has established himself as a premier front-runner, fighting at the sharp end of the grid.",
    color: "from-orange-500 to-yellow-500",
  },
  {
    number: "14",
    name: "Fernando Alonso",
    team: "Aston Martin",
    country: "Spain",
    championships: 2,
    podiums: 106,
    wins: 32,
    style: "Tactical mastermind, aggressive starter with elite defensive defensive skill.",
    bio: "The grid's most experienced veteran. Alonso's unmatched racing intellect and aggressive style keep him competitive against drivers half his age.",
    color: "from-emerald-600 to-green-500",
  }
];

export default function DriverProfiles() {
  const [selectedDriver, setSelectedDriver] = useState<DriverProfile>(DRIVERS[0]);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filteredDrivers = activeFilter === "All"
    ? DRIVERS
    : DRIVERS.filter((d) => d.team.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 w-full pt-8 border-t border-zinc-900/40">
      {/* SECTION HEADER */}
      <div className="flex items-center gap-4 border-b border-zinc-850 pb-4 mb-4">
        <div className="h-8 w-1 bg-red-600" />
        <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">
          Paddock <span className="text-red-600">Driver Profiles</span>
        </h3>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {["All", "Red Bull", "Mercedes", "Ferrari", "McLaren", "Aston Martin"].map((team) => (
          <button
            key={team}
            onClick={() => {
              setActiveFilter(team);
              // Auto-select first driver matching the filter
              const firstMatch = team === "All"
                ? DRIVERS[0]
                : DRIVERS.find((d) => d.team.toLowerCase().includes(team.toLowerCase()));
              if (firstMatch) setSelectedDriver(firstMatch);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all
              ${
                activeFilter === team
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-850"
              }
            `}
          >
            {team}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch w-full">
        {/* Driver List Grid (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-2.5 w-full">
          <span className="text-zinc-550 text-[10px] font-black uppercase tracking-[0.2em] font-mono mb-1 block">
            Grid Contenders
          </span>
          <div className="grid grid-cols-1 gap-2">
            {filteredDrivers.map((driver) => (
              <button
                key={driver.name}
                onClick={() => setSelectedDriver(driver)}
                className={`group flex items-center gap-4 p-3 rounded-xl border transition-all text-left w-full
                  ${
                    selectedDriver.name === driver.name
                      ? "bg-zinc-900/80 border-red-600"
                      : "bg-zinc-900/20 border-zinc-850 hover:border-zinc-750 hover:bg-zinc-900/40"
                  }
                `}
              >
                {/* Outline Driver Number */}
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-zinc-950 font-black italic tracking-tighter text-xl text-zinc-500 group-hover:text-red-500 border border-zinc-900 transition-colors">
                  #{driver.number}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-white text-sm uppercase block truncate group-hover:text-red-500 transition-colors">
                    {driver.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-tight block truncate mt-0.5">
                    {driver.team}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Driver Profile card (3 Columns) */}
        <div className="lg:col-span-3 border border-zinc-850 bg-zinc-950/50 p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between w-full min-h-[360px]">
          {/* Accent strip */}
          <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${selectedDriver.color}`} />

          <div className="flex flex-col gap-5">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-zinc-850 border border-zinc-800 text-zinc-400 rounded tracking-wider">
                  {selectedDriver.team}
                </span>
                <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter mt-1">
                  {selectedDriver.name}
                </h4>
              </div>
              <div className="text-5xl font-black italic text-zinc-800/60 font-mono tracking-tighter">
                #{selectedDriver.number}
              </div>
            </div>

            {/* Bios */}
            <div className="flex flex-col gap-2">
              <span className="text-zinc-555 text-[9px] font-black uppercase tracking-[0.2em] font-mono">
                Driver Profile & Style
              </span>
              <p className="text-xs text-zinc-350 leading-relaxed font-sans">
                {selectedDriver.bio}
              </p>
              <div className="p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl mt-1">
                <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">
                  Driving Style:
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed font-medium">
                  {selectedDriver.style}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-zinc-900 mt-6">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-555 uppercase tracking-widest font-mono">
                Championships
              </span>
              <span className="text-2xl font-black text-white font-mono mt-0.5">
                {selectedDriver.championships}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-555 uppercase tracking-widest font-mono">
                Grand Prix Wins
              </span>
              <span className="text-2xl font-black text-white font-mono mt-0.5">
                {selectedDriver.wins}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-555 uppercase tracking-widest font-mono">
                Podium finishes
              </span>
              <span className="text-2xl font-black text-red-500 font-mono mt-0.5">
                {selectedDriver.podiums}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
