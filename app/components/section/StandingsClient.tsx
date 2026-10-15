"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import TeamLogo from "@/components/TeamLogo";

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
  const [showAllDrivers, setShowAllDrivers] = useState(false);
  const [showAllTeams, setShowAllTeams] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined") {
        if (window.location.hash === "#constructors-standings") {
          setActiveTab("constructors");
        } else if (window.location.hash === "#drivers-standings") {
          setActiveTab("drivers");
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter lists based on search query
  const filteredDrivers = useMemo(() => {
    return driversStandings.filter(
      (driver) =>
        driver.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.team_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [driversStandings, searchQuery]);

  const filteredConstructors = useMemo(() => {
    return constructorsStandings.filter((team) =>
      team.team_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [constructorsStandings, searchQuery]);

  const leaderPoints = Number(driversStandings[0]?.points_current || 0);
  const teamLeaderPoints = Number(constructorsStandings[0]?.points_current || 0);

  // Determine displayed slice
  const displayedDrivers = searchQuery
    ? filteredDrivers
    : showAllDrivers
      ? filteredDrivers
      : filteredDrivers.slice(0, 10);

  const displayedConstructors = searchQuery
    ? filteredConstructors
    : showAllTeams
      ? filteredConstructors
      : filteredConstructors.slice(0, 10);

  const getCleanHex = (hex?: string) => {
    if (!hex) return "#52525b";
    const clean = hex.replace("#", "").trim();
    return clean.length === 6 ? `#${clean}` : `#${clean || "52525b"}`;
  };

  return (
    <div id="constructors-standings" className="w-full max-w-full flex flex-col gap-6 scroll-mt-24">
      {/* TABS & SEARCH BAR CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full max-w-full">
        {/* Modern Segmented Control Tab Switcher */}
        <div className="grid grid-cols-2 sm:flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
          <button
            onClick={() => {
              setActiveTab("drivers");
              setSearchQuery("");
            }}
            className={`px-3 sm:px-5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-center transition-all duration-200 cursor-pointer ${
              activeTab === "drivers"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Drivers ({driversStandings.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("constructors");
              setSearchQuery("");
            }}
            className={`px-3 sm:px-5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-center transition-all duration-200 cursor-pointer ${
              activeTab === "constructors"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Constructors ({constructorsStandings.length})
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full sm:w-72 max-w-full">
          <input
            type="text"
            placeholder={
              activeTab === "drivers"
                ? "Filter driver or team..."
                : "Filter constructor..."
            }
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-9 pr-8 py-1.5 text-xs focus:outline-none focus:border-red-500 transition-colors focus:ring-1 focus:ring-red-500/20 font-sans"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-[11px] font-mono cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* STANDINGS TABLE (NATURAL PAGE FLOW - NO CLUNKY INNER SCROLL TRAP) */}
      <div className="w-full max-w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="flex items-center px-4 sm:px-6 py-3 border-b border-zinc-800/80 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900/50">
          <span className="w-10 sm:w-14 text-center">Pos</span>
          <span className="flex-1 ml-2 sm:ml-4">
            {activeTab === "drivers" ? "Driver" : "Constructor"}
          </span>
          {activeTab === "drivers" && (
            <span className="hidden md:block w-48 text-left">Constructor</span>
          )}
          <span className="hidden sm:block w-24 text-right">Gap</span>
          <span className="w-20 text-right pr-2">Points</span>
        </div>

        {/* Rows List */}
        <div className="divide-y divide-zinc-900/80">
          {activeTab === "drivers" ? (
            displayedDrivers.length > 0 ? (
              displayedDrivers.map((driver, index) => {
                const pos = driver.position || index + 1;
                const isP1 = pos === 1;
                const isP2 = pos === 2;
                const isP3 = pos === 3;
                const isTop3 = isP1 || isP2 || isP3;
                const teamHex = getCleanHex(driver.team_colour);

                // Driver name formatting
                const parts = (driver.full_name || "").split(" ");
                const surname = parts.length > 1 ? parts.pop() : driver.full_name;
                const given = parts.join(" ");

                const pts = Number(driver.points_current || 0);
                const gap = isP1 ? "LEADER" : `-${Math.abs(leaderPoints - pts)} PTS`;

                return (
                  <div
                    key={`${driver.driver_number}-${pos}`}
                    className={`group flex items-center px-4 sm:px-6 py-2.5 sm:py-3 transition-colors duration-150 hover:bg-zinc-850/50 ${
                      isP1
                        ? "bg-amber-500/[0.04]"
                        : isP2
                          ? "bg-zinc-400/[0.02]"
                          : isP3
                            ? "bg-amber-700/[0.02]"
                            : ""
                    }`}
                  >
                    {/* Position Badge */}
                    <div className="w-10 sm:w-14 flex items-center justify-center flex-shrink-0">
                      {isP1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-black font-black italic text-xs shadow-md shadow-amber-400/30">
                          1
                        </span>
                      ) : isP2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-300 text-black font-black italic text-xs shadow-sm">
                          2
                        </span>
                      ) : isP3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black italic text-xs shadow-sm">
                          3
                        </span>
                      ) : (
                        <span
                          className={`font-mono font-bold text-xs sm:text-sm ${
                            pos <= 10 ? "text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          {pos}
                        </span>
                      )}
                    </div>

                    {/* Driver Avatar & Name */}
                    <div className="flex-1 ml-2 sm:ml-4 flex items-center min-w-0">
                      <div
                        className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full flex-shrink-0 overflow-hidden border-2 shadow-inner mr-3"
                        style={{
                          backgroundColor: "#18181b",
                          borderColor: teamHex,
                        }}
                      >
                        {driver.headshot_url ? (
                          <Image
                            src={driver.headshot_url}
                            alt={driver.full_name}
                            fill
                            sizes="44px"
                            className="object-cover object-top scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-mono font-bold text-zinc-400 uppercase">
                            #{driver.driver_number}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs sm:text-sm font-sans text-zinc-300 font-medium truncate">
                            {given} <strong className="font-black text-white uppercase">{surname}</strong>
                          </span>
                          {driver.driver_number > 0 && (
                            <span className="text-[10px] font-mono font-bold text-zinc-500">
                              #{driver.driver_number}
                            </span>
                          )}
                          {isTop3 && (
                            <span
                              className={`hidden lg:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded font-black tracking-wider uppercase ${
                                isP1
                                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                  : isP2
                                    ? "bg-zinc-400/20 text-zinc-300 border border-zinc-400/30"
                                    : "bg-amber-800/20 text-amber-400 border border-amber-700/30"
                              }`}
                            >
                              {isP1 ? "TITLE LEADER" : `P${pos}`}
                            </span>
                          )}
                        </div>

                        {/* Mobile Team Name with TeamLogo */}
                        <div className="flex items-center gap-1.5 md:hidden mt-0.5">
                          <TeamLogo teamName={driver.team_name} size={12} className="w-3 h-3 flex-shrink-0" />
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight truncate">
                            {driver.team_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Constructor with TeamLogo */}
                    <div className="hidden md:flex items-center gap-2 w-48 truncate">
                      <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center bg-zinc-900 border border-white/10 p-0.5 shadow-sm">
                        <TeamLogo teamName={driver.team_name} size={14} className="w-3.5 h-3.5 object-contain" />
                      </div>
                      <span className="text-xs font-sans text-zinc-400 uppercase tracking-tight truncate">
                        {driver.team_name}
                      </span>
                    </div>

                    {/* Gap Column */}
                    <div className="hidden sm:block w-24 text-right">
                      <span
                        className={`text-[11px] font-mono font-semibold ${
                          isP1 ? "text-amber-400 font-bold" : "text-zinc-500"
                        }`}
                      >
                        {gap}
                      </span>
                    </div>

                    {/* Points Column */}
                    <div className="w-20 text-right pr-2 flex-shrink-0">
                      <span className="font-mono font-black text-sm sm:text-base text-white tabular-nums tracking-tight">
                        {driver.points_current}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 ml-1">
                        PTS
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-zinc-500 uppercase font-mono text-xs tracking-wider">
                No matching drivers found for &quot;{searchQuery}&quot;
              </div>
            )
          ) : displayedConstructors.length > 0 ? (
            displayedConstructors.map((team, index) => {
              const pos = team.position || index + 1;
              const isP1 = pos === 1;
              const isP2 = pos === 2;
              const isP3 = pos === 3;
              const teamHex = getCleanHex(team.team_colour);
              const pts = Number(team.points_current || 0);
              const gap = isP1 ? "LEADER" : `-${Math.abs(teamLeaderPoints - pts)} PTS`;

              return (
                <div
                  key={`${team.team_name}-${pos}`}
                  className={`group flex items-center px-4 sm:px-6 py-3 transition-colors duration-150 hover:bg-zinc-850/50 ${
                    isP1
                      ? "bg-amber-500/[0.04]"
                      : isP2
                        ? "bg-zinc-400/[0.02]"
                        : isP3
                          ? "bg-amber-700/[0.02]"
                          : ""
                  }`}
                >
                  {/* Position Badge */}
                  <div className="w-10 sm:w-14 flex items-center justify-center flex-shrink-0">
                    {isP1 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-black font-black italic text-xs shadow-md shadow-amber-400/30">
                        1
                      </span>
                    ) : isP2 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-300 text-black font-black italic text-xs shadow-sm">
                        2
                      </span>
                    ) : isP3 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black italic text-xs shadow-sm">
                        3
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-xs sm:text-sm text-zinc-400">
                        {pos}
                      </span>
                    )}
                  </div>

                  {/* Constructor Avatar with TeamLogo & Name */}
                  <div className="flex-1 ml-2 sm:ml-4 flex items-center gap-3 min-w-0">
                    <div
                      className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full flex-shrink-0 flex items-center justify-center border-2 shadow-inner bg-zinc-900/90 p-2"
                      style={{ borderColor: teamHex }}
                    >
                      <TeamLogo teamName={team.team_name} size={22} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                    </div>
                    <span className="text-xs sm:text-sm font-black italic uppercase tracking-tight text-white truncate group-hover:text-red-500 transition-colors">
                      {team.team_name}
                    </span>
                  </div>

                  {/* Gap Column */}
                  <div className="hidden sm:block w-24 text-right">
                    <span
                      className={`text-[11px] font-mono font-semibold ${
                        isP1 ? "text-amber-400 font-bold" : "text-zinc-500"
                      }`}
                    >
                      {gap}
                    </span>
                  </div>

                  {/* Points Column */}
                  <div className="w-20 text-right pr-2 flex-shrink-0">
                    <span className="font-mono font-black text-sm sm:text-base text-white tabular-nums tracking-tight">
                      {team.points_current}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 ml-1">
                      PTS
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-zinc-500 uppercase font-mono text-xs tracking-wider">
              No matching constructors found for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* EXPAND / COLLAPSE FOOTER TOGGLE */}
        {!searchQuery && (
          <div className="border-t border-zinc-800/80 px-4 sm:px-6 py-3 bg-zinc-900/40 flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500">
              Showing{" "}
              {activeTab === "drivers"
                ? `${displayedDrivers.length} of ${driversStandings.length} Drivers`
                : `${displayedConstructors.length} of ${constructorsStandings.length} Teams`}
            </span>

            {activeTab === "drivers" ? (
              driversStandings.length > 10 && (
                <button
                  onClick={() => setShowAllDrivers(!showAllDrivers)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  <span>{showAllDrivers ? "Show Top 10 Only" : `Show All ${driversStandings.length} Drivers`}</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showAllDrivers ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )
            ) : (
              constructorsStandings.length > 10 && (
                <button
                  onClick={() => setShowAllTeams(!showAllTeams)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  <span>{showAllTeams ? "Show Top 10 Only" : `Show All ${constructorsStandings.length} Teams`}</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showAllTeams ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
