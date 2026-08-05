"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

type RaceInfo = {
  round: string;
  raceName: string;
  circuitName: string;
  country: string;
  locality: string;
  raceDate: string;
  isPast: boolean;
  winner: {
    name: string;
    code: string;
    team: string;
    number: number;
    grid: string;
    time: string;
    laps: string;
    headshotUrl: string;
  } | null;
};

const TEAM_COLORS: Record<string, string> = {
  "red bull": "3671C6",
  "red bull racing": "3671C6",
  "mercedes": "27F4D2",
  "ferrari": "E80020",
  "mclaren": "FF8000",
  "aston martin": "229971",
  "alpine f1 team": "0093cc",
  "alpine": "0093cc",
  "williams": "64C4FF",
  "rb f1 team": "6692FF",
  "rb": "6692FF",
  "kick sauber": "52E252",
  "sauber": "52E252",
  "haas f1 team": "B6BABD",
  "haas": "B6BABD",
  "audi": "E00000",
  "cadillac f1 team": "FFD700",
};

function formatDate(dateStr: string, mounted: boolean) {
  const d = new Date(dateStr);
  if (!mounted) {
    return {
      day: d.getUTCDate(),
      month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
      weekday: d.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" }).toUpperCase(),
      full: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    };
  }
  return {
    day: d.getDate(),
    month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
    weekday: d.toLocaleString("default", { weekday: "short" }).toUpperCase(),
    full: d.toLocaleDateString([], { month: "short", day: "numeric" }),
  };
}

export default function ResultsClient({ races }: { races: RaceInfo[] }) {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "finished" | "upcoming">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const filteredRaces = races.filter((race) => {
    // Filter by type
    if (filter === "finished" && !race.winner) return false;
    if (filter === "upcoming" && race.winner) return false;

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchRace = race.raceName.toLowerCase().includes(q) ||
        race.circuitName.toLowerCase().includes(q) ||
        race.country.toLowerCase().includes(q) ||
        race.locality.toLowerCase().includes(q);

      const matchWinner = race.winner && (
        race.winner.name.toLowerCase().includes(q) ||
        race.winner.team.toLowerCase().includes(q) ||
        race.winner.code.toLowerCase().includes(q)
      );

      return matchRace || matchWinner;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* FILTERS & SEARCH ROW */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        {/* Filter Pills */}
        <div className="flex bg-zinc-950 p-1 rounded-full border border-zinc-800/80 w-full md:w-auto">
          {(["all", "finished", "upcoming"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 text-xs font-black uppercase italic tracking-wider transition-all rounded-full ${
                filter === type
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {type === "all" ? "All Rounds" : type === "finished" ? "Finished" : "Upcoming"}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500 group-focus-within:text-red-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search GP, Driver, or Constructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 text-sm text-white placeholder-zinc-500 rounded-full focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-mono"
          />
        </div>
      </div>

      {/* RACES LIST */}
      <div className="flex flex-col gap-4">
        {filteredRaces.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">No results found</p>
          </div>
        ) : (
          filteredRaces.map((race) => {
            const raceDate = formatDate(race.raceDate, mounted);
            const teamLower = race.winner?.team.toLowerCase() || "";
            const teamColor = TEAM_COLORS[teamLower] || "3f3f46";
            const borderAccentColor = `#${teamColor}`;

            return (
              <div
                key={race.round}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 group ${
                  race.winner
                    ? "border-zinc-800/80 bg-zinc-900/15 hover:border-zinc-700/80 hover:bg-zinc-900/25"
                    : "border-zinc-800/40 bg-zinc-900/5 opacity-70"
                }`}
                style={{
                  borderLeftWidth: race.winner ? "6px" : "1px",
                  borderLeftColor: race.winner ? borderAccentColor : undefined,
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6">
                  {/* Left Column: Round & Race Info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Round and Date Badge */}
                    <div className="flex flex-col items-center justify-center p-3 w-16 h-16 rounded-xl bg-zinc-950 border border-zinc-800/50 flex-shrink-0 text-center">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest font-mono">
                        R{race.round}
                      </span>
                      <span className="text-2xl font-black italic leading-none my-0.5 text-white">
                        {raceDate.day}
                      </span>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
                        {raceDate.month}
                      </span>
                    </div>

                    {/* Race Details */}
                    <div className="min-w-0">
                      <h3 className="text-xl font-black italic uppercase text-white tracking-tight leading-tight group-hover:text-red-500 transition-colors">
                        {race.raceName}
                      </h3>
                      <p className="text-xs font-mono text-zinc-400 mt-1 truncate">
                        {race.circuitName}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {race.locality}, {race.country}
                      </p>
                    </div>
                  </div>

                  {/* Right Columns: Winner info / TBD status */}
                  {race.winner ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:justify-end">
                      {/* Driver Showcase */}
                      <div className="flex items-center gap-4 p-2 bg-zinc-950/40 border border-zinc-800/40 rounded-2xl w-full sm:w-64 md:w-72 flex-shrink-0">
                        {/* Driver Headshot */}
                        <div className="w-16 h-16 relative bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800">
                          {race.winner.headshotUrl ? (
                            <Image
                              src={race.winner.headshotUrl}
                              alt={race.winner.name}
                              width={80}
                              height={80}
                              className="object-contain drop-shadow-md scale-110 translate-y-1"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-black italic text-zinc-600">
                              {race.winner.code}
                            </div>
                          )}
                        </div>

                        {/* Driver Name & Constructor */}
                        <div className="pr-4 min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">
                            Race Winner
                          </span>
                          <span className="text-base font-black italic text-white leading-tight block truncate">
                            {race.winner.name}
                          </span>
                          <span
                            className="text-xs font-mono font-bold uppercase tracking-wider block mt-0.5 truncate"
                            style={{ color: borderAccentColor }}
                          >
                            {race.winner.team}
                          </span>
                        </div>
                      </div>

                      {/* Mini Stats Grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono text-zinc-400 sm:border-l sm:border-zinc-800 sm:pl-6 flex-shrink-0">
                        <div>
                          <span className="text-zinc-600 block text-[9px] uppercase tracking-wider font-mono">Started</span>
                          <span className="text-white font-bold">P{race.winner.grid}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 block text-[9px] uppercase tracking-wider font-mono">Laps</span>
                          <span className="text-white font-bold">{race.winner.laps}</span>
                        </div>
                        <div className="col-span-2 mt-0.5">
                          <span className="text-zinc-600 block text-[9px] uppercase tracking-wider font-mono">Winning Time</span>
                          <span className="text-emerald-400 font-bold truncate block max-w-[120px]">{race.winner.time}</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link
                        href={`/race/${race.round}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-900 border border-zinc-700 hover:border-red-600 hover:bg-zinc-900 text-white text-xs font-black uppercase italic tracking-widest rounded-xl transition-all hover:scale-102 flex-shrink-0"
                      >
                        View Details
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 lg:justify-end w-full lg:w-auto">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono text-[10px] uppercase tracking-widest flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        TBD / Upcoming
                      </div>
                      <Link
                        href={`/schedule`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-black uppercase italic tracking-widest rounded-xl transition-all flex-shrink-0 ml-auto lg:ml-0"
                      >
                        View Schedule
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
