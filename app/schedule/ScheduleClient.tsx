"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

type SessionInfo = { name: string; dateStr: string };
type RaceInfo = {
  round: string;
  raceName: string;
  circuitName: string;
  country: string;
  locality: string;
  raceDate: string;
  sessions: SessionInfo[];
  status: "past" | "active" | "upcoming";
  circuitImage: string;
  winner: { name: string; code: string; team: string } | null;
};

function formatDate(dateStr: string, mounted: boolean) {
  const d = new Date(dateStr);
  if (!mounted) {
    return {
      day: d.getUTCDate(),
      month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
      weekday: d.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" }).toUpperCase(),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }),
      full: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    };
  }
  return {
    day: d.getDate(),
    month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
    weekday: d.toLocaleString("default", { weekday: "short" }).toUpperCase(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    full: d.toLocaleDateString([], { month: "short", day: "numeric" }),
  };
}

function RaceCard({
  race,
  isHighlighted,
  mounted,
  globalNextSessionDateStr,
}: {
  race: RaceInfo;
  isHighlighted: boolean;
  mounted: boolean;
  globalNextSessionDateStr: string | null;
}) {
  const [expanded, setExpanded] = useState(isHighlighted);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to highlighted card on mount
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [isHighlighted]);

  const raceDate = formatDate(race.raceDate, mounted);
  const isPast = race.status === "past";
  const isActive = race.status === "active";

  const now = new Date();
  const nextSession = race.sessions.find((s) => new Date(s.dateStr) > now);
  const isCurrentWeekend = isActive || (isHighlighted && !isPast);

  const cardHeaderInner = (
    <div className="flex items-stretch">
          {/* Round number / date column */}
          <div
            className={`flex flex-col items-center justify-center px-5 py-5 min-w-[80px] border-r
              ${isPast ? "border-zinc-800/30 bg-zinc-900/20" : ""}
              ${isActive ? "border-red-600/30 bg-red-600/10" : ""}
              ${!isPast && !isActive ? "border-zinc-800/50 bg-zinc-900/30" : ""}
            `}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest font-mono
              ${isPast ? "text-zinc-600" : isActive ? "text-red-500" : "text-zinc-500"}`}>
              R{race.round}
            </span>
            <span className={`text-3xl font-black italic leading-none my-1
              ${isPast ? "text-zinc-650" : "text-white"}`}>
              {raceDate.day}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wide
              ${isPast ? "text-zinc-600" : isActive ? "text-red-400" : "text-zinc-400"}`}>
              {raceDate.month}
            </span>
          </div>

          {/* Race info */}
          <div className="flex-1 px-6 py-5 flex items-center gap-4 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                {isActive && (
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-red-600 text-white rounded tracking-widest animate-pulse">
                    Active Weekend
                  </span>
                )}
                {isCurrentWeekend && !isActive && (
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-zinc-800 text-zinc-300 rounded tracking-widest">
                    Up Next
                  </span>
                )}
              </div>
              <h3 className={`text-lg font-black italic uppercase tracking-tight truncate
                ${isPast ? "text-zinc-500 group-hover:text-red-500 transition-colors" : "text-white"}`}>
                {race.raceName}
              </h3>
              <p className={`text-xs font-mono mt-0.5 truncate
                ${isPast ? "text-zinc-600" : "text-zinc-400"}`}>
                {race.circuitName} • {race.locality}, {race.country}
              </p>
              {!isPast && nextSession && (
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">
                  Next: {nextSession.name} — {formatDate(nextSession.dateStr, mounted).full} {formatDate(nextSession.dateStr, mounted).time}
                </p>
              )}
              {isPast && race.winner && (
                <div className="flex md:hidden items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest font-mono">Winner</span>
                  <span className="text-xs font-black text-zinc-400 italic">{race.winner.name}</span>
                  <span className="text-[9px] font-medium text-zinc-600 font-mono">({race.winner.team})</span>
                </div>
              )}
            </div>

            {/* Winner chip for past races (Desktop) */}
            {isPast && race.winner && (
              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-850">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest font-mono">Winner</span>
                  <span className="text-xs font-black text-white italic">{race.winner.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({race.winner.team})</span>
                </div>
              </div>
            )}

            {/* Circuit image (right, small) */}
            {race.circuitImage && !isPast && (
              <div className="hidden md:flex items-center justify-center w-24 flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={race.circuitImage}
                  alt={race.circuitName}
                  className="w-24 h-auto object-contain filter contrast-125"
                />
              </div>
            )}

            {/* Expand chevron or link arrow */}
            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors
              ${isPast ? "text-zinc-600 group-hover:text-zinc-300" : "text-zinc-500 group-hover:text-zinc-300"}`}>
              {isPast ? (
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
        </div>
      </div>
    );

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 group
        ${isPast ? "border-zinc-800/50 bg-zinc-900/20 opacity-60 hover:border-zinc-700/80" : ""}
        ${isActive ? "border-red-600/60 bg-zinc-900/60 shadow-xl shadow-red-600/10" : ""}
        ${!isPast && !isActive ? "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700" : ""}
      `}
    >
      {/* Active pulse ring */}
      {isActive && (
        <div className="absolute inset-0 rounded-2xl border border-red-600/30 animate-pulse pointer-events-none" />
      )}

      {/* CARD HEADER */}
      {isPast ? (
        <Link
          id={`race-round-${race.round}`}
          href={`/race/${race.round}`}
          className="w-full text-left block"
        >
          {cardHeaderInner}
        </Link>
      ) : (
        <button
          id={`race-round-${race.round}`}
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left"
          aria-expanded={expanded}
        >
          {cardHeaderInner}
        </button>
      )}

      {/* SESSIONS DRAWER */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out
          ${expanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-6 pb-5 pt-0">
          {/* Past race: show View Results CTA */}
          {isPast && (
            <div className="border-t border-zinc-800/30 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                {race.winner && (
                  <div className="mb-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block">Race Winner</span>
                    <span className="text-base font-black italic text-white">{race.winner.name}</span>
                    <span className="text-xs text-zinc-500 font-mono ml-2">{race.winner.team}</span>
                  </div>
                )}
              </div>
              <Link
                href={`/race/${race.round}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase italic tracking-widest rounded-xl transition-colors flex-shrink-0"
              >
                View Full Results
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}

          {/* Sessions grid */}
          <div className={`${isPast ? "mt-3" : ""} border-t pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3
            ${isPast ? "border-zinc-800/30" : "border-zinc-800/60"}`}>
            {race.sessions.map((session, idx) => {
              const sDate = formatDate(session.dateStr, mounted);
              const sessionDt = new Date(session.dateStr);
              const sessionPast = sessionDt < now;
              const isNextUp = globalNextSessionDateStr === session.dateStr;

              return (
                <div
                  key={idx}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                    ${sessionPast ? "border-zinc-800/30 bg-zinc-900/20 opacity-50" : ""}
                    ${isNextUp ? "border-red-600/50 bg-red-600/5" : ""}
                    ${!sessionPast && !isNextUp ? "border-zinc-800/50 bg-zinc-900/30 hover:border-zinc-700" : ""}
                  `}
                >
                  {isNextUp && (
                    <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 text-[8px] font-black uppercase bg-red-600 text-white rounded tracking-widest">
                      up next
                    </span>
                  )}
                  <div className={`flex flex-col items-center justify-center border-r pr-3 min-w-[50px]
                    ${sessionPast ? "border-zinc-800/30" : "border-zinc-800/60"}`}>
                    <span className={`text-[10px] font-bold uppercase ${sessionPast ? "text-zinc-600" : "text-zinc-500"}`}>
                      {sDate.weekday}
                    </span>
                    <span className={`text-xl font-black italic leading-none ${sessionPast ? "text-zinc-600" : "text-white"}`}>
                      {sDate.day}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-black uppercase tracking-tight truncate
                      ${sessionPast ? "text-zinc-600" : isNextUp ? "text-red-400" : "text-zinc-300"}`}>
                      {session.name}
                    </span>
                    <span className={`text-xs font-mono ${sessionPast ? "text-zinc-700" : "text-zinc-500"}`}>
                      {sDate.time}
                    </span>
                  </div>
                  {sessionPast && (
                    <svg className="ml-auto w-3.5 h-3.5 text-zinc-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleClient({
  races,
  highlightIndex,
}: {
  races: RaceInfo[];
  highlightIndex: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  // Compute the single globally next session across all races
  const now = new Date();
  let globalNextSessionDateStr: string | null = null;
  for (const race of races) {
    for (const session of race.sessions) {
      if (new Date(session.dateStr) > now) {
        if (
          !globalNextSessionDateStr ||
          new Date(session.dateStr) < new Date(globalNextSessionDateStr)
        ) {
          globalNextSessionDateStr = session.dateStr;
        }
        break; // sessions are already sorted, so first future one per race is enough
      }
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const filtered = races.filter((r) => {
    if (filter === "upcoming") return r.status !== "past";
    if (filter === "past") return r.status === "past";
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filter pills */}
      <div className="flex items-center gap-3">
        {(["all", "upcoming", "past"] as const).map((f) => (
          <button
            key={f}
            id={`schedule-filter-${f}`}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-black uppercase italic tracking-widest rounded-full border transition-all cursor-pointer
              ${filter === f
                ? "bg-red-600 border-red-600 text-white"
                : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
              }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-zinc-600 font-mono text-xs">
          {filtered.length} / {races.length} races
        </span>
      </div>

      {/* Race cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((race, idx) => {
          const originalIdx = races.indexOf(race);
          return (
            <RaceCard
              key={race.round}
              race={race}
              isHighlighted={originalIdx === highlightIndex}
              mounted={mounted}
              globalNextSessionDateStr={globalNextSessionDateStr}
            />
          );
        })}
      </div>
    </div>
  );
}
