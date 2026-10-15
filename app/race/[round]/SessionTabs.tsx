"use client";

import React, { useState, useEffect } from "react";
import Podium from "@/components/Podium";
import TeamLogo from "@/components/TeamLogo";
import PracticeClassification from "./PracticeClassification";
import QualifyingClassification from "./QualifyingClassification";
import SprintClassification from "./SprintClassification";
import { SessionTabInfo, TEAM_COLORS } from "@/utils/sessionResults";

function statusColor(status: string) {
  if (status === "Finished" || status.startsWith("+")) return "text-emerald-400";
  if (
    status.toLowerCase().includes("accident") ||
    status.toLowerCase().includes("collision")
  )
    return "text-orange-400";
  if (status === "Disqualified") return "text-red-500";
  return "text-zinc-500";
}

function statusLabel(status: string) {
  if (status.startsWith("+")) return status;
  const map: Record<string, string> = {
    Finished: "Finished",
    "Lap 1 Accident": "Accident L1",
    Accident: "Accident",
    Collision: "Collision",
    "Collision damage": "Collision Dmg",
    Engine: "Engine",
    Gearbox: "Gearbox",
    Hydraulics: "Hydraulics",
    Brakes: "Brakes",
    Electrical: "Electrical",
    "Power Unit": "Power Unit",
    Retired: "Retired",
  };
  return map[status] || status;
}

export default function SessionTabs({
  sessions,
  circuitImage,
  initialSessionId,
  driverImages = {},
  qualiPositions = {},
}: {
  sessions: SessionTabInfo[];
  circuitImage?: string;
  initialSessionId?: string;
  driverImages?: Record<string, string>;
  qualiPositions?: Record<string, number>;
}) {
  // Determine default active session:
  // 1. Matched by initialSessionId query
  // 2. Latest completed session (reverse find)
  // 3. First session
  const findDefaultSession = () => {
    if (initialSessionId) {
      const match = sessions.find((s) => s.id === initialSessionId);
      if (match) return match.id;
    }
    const latestCompleted = [...sessions].reverse().find((s) => s.isCompleted);
    if (latestCompleted) return latestCompleted.id;
    return sessions[0]?.id || "race";
  };

  const [activeSessionId, setActiveSessionId] = useState<string>(findDefaultSession);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("session", id);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
          No session schedule found for this race weekend.
        </p>
      </div>
    );
  }

  // Format date helper
  const formatSessionTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (!mounted) {
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }),
        weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }).toUpperCase(),
      };
    }
    return {
      date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      weekday: d.toLocaleDateString([], { weekday: "short" }).toUpperCase(),
    };
  };

  // Render Race specific content
  const renderRaceView = () => {
    const results = activeSession.raceResults || [];
    if (results.length === 0) {
      return renderUpcomingView();
    }

    const winner = results[0];
    const podium = results.slice(0, 3);
    const retirements = results.filter(
      (r: any) => !r.status?.startsWith("+") && r.status !== "Finished"
    );
    const fastestLapHolder = results.find((r: any) => r.FastestLap?.rank === "1");
    const winnerTeamColor = `#${
      TEAM_COLORS[winner.Constructor?.name?.toLowerCase() || ""] || "E80020"
    }`;

    return (
      <div className="flex flex-col gap-12">
        {/* ── WINNER HERO ── */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 70% 50%, ${winnerTeamColor} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch">
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-3 block">
                Grand Prix Winner
              </span>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
                {winner.Driver?.givenName}
                <br />
                <span style={{ color: winnerTeamColor }}>
                  {winner.Driver?.familyName}
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center bg-zinc-900 border border-white/10 p-0.5 shadow-sm">
                  <TeamLogo teamName={winner.Constructor?.name || ""} size={14} className="w-3.5 h-3.5 object-contain" />
                </div>
                <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">
                  {winner.Constructor?.name}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-6">
                {[
                  { label: "Time", value: winner.Time?.time || "—" },
                  { label: "Points", value: winner.points },
                  { label: "Grid", value: `P${winner.grid}` },
                  { label: "Laps", value: winner.laps },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                      {label}
                    </p>
                    <p className="text-white font-black font-mono text-lg">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Circuit Map */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-zinc-800/80 bg-zinc-950/20 flex flex-col justify-center items-center">
              {circuitImage ? (
                <div className="w-full h-48 md:h-64 flex items-center justify-center p-8 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={circuitImage}
                    alt="Circuit outline map"
                    className="w-full h-full object-contain filter invert opacity-75 contrast-125 drop-shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:scale-102 transition-transform duration-300 pointer-events-none"
                  />
                </div>
              ) : (
                <div className="w-full h-48 md:h-64 flex items-center justify-center">
                  <span className="text-xs font-black text-zinc-600 tracking-widest font-mono uppercase">
                    Circuit Map N/A
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── PODIUM ── */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-1 bg-red-600" />
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">
              Podium
            </h3>
          </div>
          {(() => {
            const podiumDrivers = podium.map((result: any) => {
              const driver = result.Driver || {};
              const constructor = result.Constructor || {};
              const teamName = constructor?.name || "";
              const driverNumber = String(driver.permanentNumber || result.number);
              const headshotUrl = driverImages[driverNumber] || "";

              return {
                position: parseInt(result.position, 10),
                name_acronym: driver.code,
                full_name: `${driver.givenName} ${driver.familyName}`,
                team_name: teamName,
                team_colour: TEAM_COLORS[teamName.toLowerCase()] || "333333",
                headshot_url: headshotUrl,
                time: result.Time?.time || (parseInt(result.position, 10) === 1 ? "Winner" : undefined),
                points: result.points,
                driver_number: driverNumber,
              };
            });

            return <Podium drivers={podiumDrivers} />;
          })()}
        </div>

        {/* ── KEY EVENTS ── */}
        {(retirements.length > 0 || fastestLapHolder) && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-1 bg-red-600" />
              <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">
                Key Events
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fastestLapHolder && (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-purple-500/20 bg-purple-600/5">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                      Fastest Lap
                    </p>
                    <p className="text-white font-bold text-sm">
                      {fastestLapHolder.Driver?.givenName}{" "}
                      {fastestLapHolder.Driver?.familyName}
                    </p>
                    <p className="text-zinc-500 text-xs font-mono">
                      {fastestLapHolder.FastestLap?.Time?.time} — Lap{" "}
                      {fastestLapHolder.FastestLap?.lap}
                    </p>
                  </div>
                </div>
              )}
              {retirements.slice(0, 8).map((r: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-zinc-500 italic">
                      {r.Driver?.code}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Retirement
                    </p>
                    <p className="text-zinc-300 font-bold text-sm">
                      {r.Driver?.givenName} {r.Driver?.familyName}
                    </p>
                    <p className={`text-xs font-mono ${statusColor(r.status)}`}>
                      {statusLabel(r.status)} — Lap {r.laps}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FULL CLASSIFICATION TABLE ── */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-1 bg-red-600" />
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">
              Full Classification
            </h3>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  {["Pos", "Driver", "Constructor", "Grid", "Laps", "Time / Gap", "Interval", "Pts"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500
                          ${i === 2 ? "hidden md:table-cell" : ""}
                          ${i === 3 ? "hidden sm:table-cell" : ""}
                          ${i === 4 ? "hidden lg:table-cell" : ""}
                          ${i === 6 ? "hidden sm:table-cell" : ""}
                        `}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {results.map((result: any, i: number) => {
                  const teamColor = `#${
                    TEAM_COLORS[result.Constructor?.name?.toLowerCase() || ""] || "333"
                  }`;
                  const isP1 = result.position === "1";
                  const finished =
                    result.status === "Finished" || result.status?.startsWith("+") || result.status === "Lapped";
                  const hasFastestLap = result.FastestLap?.rank === "1";
                  const fullName = `${result.Driver?.givenName} ${result.Driver?.familyName}`;
                  const qualiPos = qualiPositions[fullName];
                  const posDiff = qualiPos ? qualiPos - parseInt(result.position, 10) : null;

                  // 1. Race Completed Time (Winner) or Gap to Leader
                  let timeOrGapDisplay = "";
                  if (isP1) {
                    timeOrGapDisplay = result.Time?.time || "Winner";
                  } else if (result.Time?.time) {
                    const clean = result.Time.time.replace(/s$/i, "");
                    timeOrGapDisplay = clean.startsWith("+") ? `${clean}s` : `+${clean}s`;
                  } else if (result.status?.startsWith("+")) {
                    timeOrGapDisplay = result.status;
                  } else if (result.status === "Lapped") {
                    const lapDiff = results[0]?.laps
                      ? parseInt(results[0].laps, 10) - parseInt(result.laps || "0", 10)
                      : 1;
                    timeOrGapDisplay = `+${lapDiff} Lap${lapDiff > 1 ? "s" : ""}`;
                  } else {
                    timeOrGapDisplay = statusLabel(result.status);
                  }

                  // 2. Interval Between Each Consecutive Racer
                  let intervalDisplay = "—";
                  if (isP1) {
                    intervalDisplay = "LEADER";
                  } else if (finished) {
                    const prev = results[i - 1];
                    if (result.Time?.millis && prev?.Time?.millis) {
                      const curMs = parseInt(result.Time.millis, 10);
                      const prevMs = parseInt(prev.Time.millis, 10);
                      const diffMs = curMs - prevMs;
                      if (!isNaN(diffMs) && diffMs >= 0) {
                        intervalDisplay = `+${(diffMs / 1000).toFixed(3)}s`;
                      }
                    } else if (i === 1 && result.Time?.time) {
                      const clean = result.Time.time.replace(/s$/i, "");
                      intervalDisplay = clean.startsWith("+") ? `${clean}s` : `+${clean}s`;
                    } else if (result.laps && prev?.laps && result.laps !== prev.laps) {
                      const lapDiff = parseInt(prev.laps, 10) - parseInt(result.laps, 10);
                      intervalDisplay = `+${lapDiff} Lap${lapDiff > 1 ? "s" : ""}`;
                    }
                  }

                  return (
                    <tr
                      key={i}
                      className={`border-b border-zinc-800/50 transition-colors
                        ${isP1 ? "bg-zinc-900/60" : "hover:bg-zinc-900/30"}
                        ${!finished ? "opacity-60" : ""}
                      `}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`font-black italic text-base ${
                            isP1 ? "text-amber-400" : "text-zinc-400"
                          }`}
                        >
                          {result.position}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-1 h-6 rounded-full flex-shrink-0"
                            style={{ background: teamColor }}
                          />
                          <div>
                            <p
                              className={`font-black uppercase text-xs tracking-tight ${
                                isP1 ? "text-white" : "text-zinc-200"
                              }`}
                            >
                              {result.Driver?.givenName}{" "}
                              <span className="text-zinc-400">
                                {result.Driver?.familyName}
                              </span>
                            </p>
                            {hasFastestLap && (
                              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">
                                ⚡ Fastest Lap
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center bg-zinc-900 border border-white/10 p-0.5">
                            <TeamLogo teamName={result.Constructor?.name || ""} size={12} className="w-3 h-3 object-contain" />
                          </div>
                          <span className="text-zinc-400 text-xs font-mono truncate">
                            {result.Constructor?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-500 text-xs font-mono">
                            P{result.grid}
                          </span>
                          {posDiff !== null && posDiff !== 0 && (
                            <span
                              className={`text-[9px] font-black ${
                                posDiff > 0 ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {posDiff > 0 ? `+${posDiff}` : posDiff}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-zinc-500 text-xs font-mono">
                          {result.laps}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-mono font-bold ${
                              isP1
                                ? "text-amber-400 font-black"
                                : finished
                                  ? "text-zinc-200"
                                  : statusColor(result.status)
                            }`}
                          >
                            {timeOrGapDisplay}
                          </span>
                          {/* Show small interval tag on mobile when interval column is hidden */}
                          {intervalDisplay !== "—" && !isP1 && (
                            <span className="sm:hidden text-[9px] font-mono text-zinc-500">
                              Int: {intervalDisplay}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className={`text-xs font-mono ${
                            isP1
                              ? "text-zinc-500 font-bold"
                              : intervalDisplay !== "—"
                                ? "text-zinc-400 font-semibold"
                                : "text-zinc-600"
                          }`}
                        >
                          {intervalDisplay}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-black ${
                            parseInt(result.points, 10) > 0
                              ? "text-white"
                              : "text-zinc-600"
                          }`}
                        >
                          {result.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Upcoming view when a session has not taken place
  const renderUpcomingView = () => {
    const sTime = formatSessionTime(activeSession.dateStr);
    return (
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/30 p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Session Scheduled
          </div>
          <h3 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tight leading-none mb-3">
            {activeSession.name}
          </h3>
          <p className="text-zinc-400 text-sm font-sans mb-6">
            Classification data is not available yet. Results and timing intervals will be published immediately after the session concludes.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono">
            <div className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40">
              <span className="text-zinc-500 uppercase block text-[10px]">Date</span>
              <span className="text-white font-bold">{sTime.weekday}, {sTime.date}</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40">
              <span className="text-zinc-500 uppercase block text-[10px]">Local Start</span>
              <span className="text-white font-bold">{sTime.time}</span>
            </div>
          </div>
        </div>

        {circuitImage && (
          <div className="w-56 h-56 flex items-center justify-center p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800/80 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={circuitImage}
              alt="Circuit outline"
              className="w-full h-full object-contain filter invert opacity-60 contrast-125 pointer-events-none"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-full overflow-x-hidden">
      {/* ── SESSION SELECTION TABS ── */}
      <div className="border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isDone = session.isCompleted;

            return (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
                  ${
                    isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800/80"
                  }
                `}
              >
                {/* Short Code Badge */}
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-black
                    ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-200"
                    }
                  `}
                >
                  {session.shortCode}
                </span>

                {/* Session Name */}
                <span>{session.name}</span>

                {/* Status Dot */}
                {isDone ? (
                  <span
                    title="Completed"
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-white" : "bg-emerald-400"
                    }`}
                  />
                ) : (
                  <span
                    title="Scheduled"
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-white/60" : "bg-zinc-600"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SESSION VIEW CONTENT ── */}
      <div>
        {activeSession.isCompleted ? (
          activeSession.type === "practice" ? (
            <PracticeClassification
              results={activeSession.practiceResults || []}
              sessionName={activeSession.name}
            />
          ) : activeSession.type === "qualifying" ? (
            <QualifyingClassification
              results={activeSession.qualifyingResults || []}
              sessionName={activeSession.name}
            />
          ) : activeSession.type === "sprint" ? (
            <SprintClassification
              results={activeSession.sprintResults || []}
              sessionName={activeSession.name}
            />
          ) : (
            renderRaceView()
          )
        ) : (
          renderUpcomingView()
        )}
      </div>
    </div>
  );
}
