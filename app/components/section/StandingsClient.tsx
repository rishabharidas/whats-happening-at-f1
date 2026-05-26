"use client";

import { useState } from "react";
import Image from "next/image";

interface DriverStanding {
  position: number;
  full_name: string;
  driver_number: number;
  team_name: string;
  team_colour: string;
  headshot_url: string;
  points_current: string | number;
}

interface TeamStanding {
  position: number;
  team_name: string;
  team_colour: string;
  points_current: string | number;
}

export default function StandingsClient({
  driversStandings,
  constructorsStandings,
}: {
  driversStandings: DriverStanding[];
  constructorsStandings: TeamStanding[];
}) {
  const [activeTab, setActiveTab] = useState<"drivers" | "constructors">(
    "drivers",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter lists based on search query
  const filteredDrivers = driversStandings.filter(
    (driver) =>
      driver.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.team_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredConstructors = constructorsStandings.filter((team) =>
    team.team_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* TABS & SEARCH BAR ROW */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        {/* Modern Segmented Control Tab Switcher */}
        <div className="flex bg-zinc-950/80 p-1 rounded-full border border-zinc-800/80 w-full md:w-auto relative">
          <button
            onClick={() => {
              setActiveTab("drivers");
              setSearchQuery("");
            }}
            className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "drivers"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Drivers
          </button>
          <button
            onClick={() => {
              setActiveTab("constructors");
              setSearchQuery("");
            }}
            className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "constructors"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Constructors
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder={
              activeTab === "drivers"
                ? "Search driver or team..."
                : "Search team..."
            }
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-zinc-900/60 border border-zinc-800 text-white rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors focus:ring-1 focus:ring-red-500/20 font-sans"
          />
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs font-bold font-sans"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* STANDINGS CONTAINER */}
      <div className="relative bg-zinc-950/20 border border-zinc-900 rounded-2xl p-4 md:p-6 overflow-hidden">
        {/* Header Label Row */}
        <div className="flex items-center px-4 py-3 text-xs font-bold uppercase text-zinc-500 tracking-widest border-b border-zinc-800/40 mb-3">
          <span className="w-12 text-center">Pos</span>
          <span className="flex-1 ml-4">
            {activeTab === "drivers" ? "Driver" : "Constructor"}
          </span>
          {activeTab === "drivers" && (
            <span className="hidden md:block w-48 pl-4">Constructor</span>
          )}
          <span className="w-16 text-right">PTS</span>
        </div>

        {/* Scrollable list box with customized thin scrollbar to avoid hijack */}
        <div className="max-h-[550px] overflow-y-auto pr-2 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {activeTab === "drivers" ? (
            filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver, index) => (
                <div
                  key={driver.driver_number}
                  className="group flex items-center bg-zinc-900/40 border border-zinc-800/60 py-2.5 pl-3 pr-6 rounded-r-lg transition-all duration-300 hover:bg-zinc-800/60 hover:border-zinc-700/60"
                  style={{
                    borderLeft: `4px solid #${driver.team_colour || "333"}`,
                  }}
                >
                  {/* Position */}
                  <span className="w-12 text-center font-black italic text-xl text-zinc-600 group-hover:text-white transition-colors">
                    {driver.position || index + 1}
                  </span>

                  {/* Driver Photo & Info */}
                  <div className="flex-1 ml-4 flex items-center min-w-0">
                    <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden bg-zinc-800/80 rounded-full border border-zinc-700/60 shadow-inner">
                      {driver.headshot_url ? (
                        <Image
                          src={driver.headshot_url}
                          alt={driver.full_name}
                          fill
                          sizes="60px"
                          className="object-cover object-top scale-110 group-hover:scale-115 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                          F1
                        </div>
                      )}
                    </div>

                    {/* Driver Name & Number */}
                    <div className="flex flex-col ml-4 min-w-0">
                      <span className="font-bold text-white uppercase tracking-tight group-hover:text-red-500 transition-colors truncate">
                        {driver.full_name}
                        <span className="ml-2 text-xs text-zinc-500 font-mono font-medium">
                          #{driver.driver_number}
                        </span>
                      </span>
                      <span className="md:hidden text-[10px] text-zinc-500 uppercase font-bold text-start mt-0.5 truncate">
                        {driver.team_name}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Team Name */}
                  <span className="hidden md:block w-48 text-sm font-medium text-zinc-400 uppercase tracking-tight truncate pl-4">
                    {driver.team_name}
                  </span>

                  {/* Points */}
                  <div className="w-16 text-right flex-shrink-0">
                    <span className="font-black text-lg text-white group-hover:text-red-500 transition-colors tabular-nums">
                      {driver.points_current}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-zinc-500 uppercase font-mono text-sm tracking-wider">
                No matching drivers found
              </div>
            )
          ) : filteredConstructors.length > 0 ? (
            filteredConstructors.map((team, index) => (
              <div
                key={team.team_name}
                className="group flex items-center bg-zinc-900/40 border border-zinc-800/60 py-3 pl-3 pr-6 rounded-r-lg transition-all duration-300 hover:bg-zinc-800/60 hover:border-zinc-700/60"
                style={{
                  borderLeft: `4px solid #${team.team_colour || "333"}`,
                }}
              >
                {/* Position */}
                <span className="w-12 text-center font-black italic text-xl text-zinc-600 group-hover:text-white transition-colors">
                  {team.position || index + 1}
                </span>

                {/* Team Name */}
                <span className="flex-1 ml-4 font-bold text-white uppercase tracking-tight group-hover:text-red-500 transition-colors truncate">
                  {team.team_name}
                </span>

                {/* Points */}
                <div className="w-16 text-right flex-shrink-0">
                  <span className="font-black text-lg text-white group-hover:text-red-500 transition-colors tabular-nums">
                    {team.points_current}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-zinc-500 uppercase font-mono text-sm tracking-wider">
              No matching constructors found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
