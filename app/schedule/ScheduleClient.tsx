"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import TeamLogo from "@/components/TeamLogo";
import { checkSessionTiming } from "@/utils/sessionTiming";

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

function getSessionSlug(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("practice 1")) return "practice-1";
  if (l.includes("practice 2")) return "practice-2";
  if (l.includes("practice 3")) return "practice-3";
  if (l.includes("sprint qualifying") || l.includes("shootout")) return "sprint-qualifying";
  if (l === "sprint") return "sprint";
  if (l.includes("qualifying")) return "qualifying";
  return "race";
}

function RaceCard({
  race,
  isHighlighted,
  mounted,
  globalNextSessionDateStr,
  now,
}: {
  race: RaceInfo;
  isHighlighted: boolean;
  mounted: boolean;
  globalNextSessionDateStr: string | null;
  now: Date;
}) {
  const ongoingSession = race.sessions.find((s) => checkSessionTiming(s.dateStr, s.name, now).isOngoing);
  const [expanded, setExpanded] = useState(isHighlighted || !!ongoingSession);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to highlighted card on mount
  useEffect(() => {
    if ((isHighlighted || ongoingSession) && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [isHighlighted, ongoingSession]);

  const raceDate = formatDate(race.raceDate, mounted);
  const isPast = race.status === "past";
  const isActive = race.status === "active" || !!ongoingSession;

  const nextSession = race.sessions.find((s) => checkSessionTiming(s.dateStr, s.name, now).isUpcoming);
  const isCurrentWeekend = isActive || (isHighlighted && !isPast);

  const cardHeaderInner = (
    <div className="flex items-stretch min-w-0">
          {/* Round number / date column */}
          <div
            className={`flex flex-col items-center justify-center px-3 sm:px-5 py-4 sm:py-5 min-w-[65px] sm:min-w-[80px] border-r flex-shrink-0
              ${isPast ? "border-zinc-800/30 bg-zinc-900/20" : ""}
              ${ongoingSession ? "border-red-500/50 bg-red-600/20" : isActive ? "border-red-600/30 bg-red-600/10" : ""}
              ${!isPast && !isActive ? "border-zinc-800/50 bg-zinc-900/30" : ""}
            `}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest font-mono
              ${isPast ? "text-zinc-600" : ongoingSession ? "text-red-400 font-bold" : isActive ? "text-red-500" : "text-zinc-500"}`}>
              R{race.round}
            </span>
            <span className={`text-2xl sm:text-3xl font-black italic leading-none my-1
              ${isPast ? "text-zinc-650" : "text-white"}`}>
              {raceDate.day}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wide
              ${isPast ? "text-zinc-600" : ongoingSession ? "text-red-400" : isActive ? "text-red-400" : "text-zinc-400"}`}>
              {raceDate.month}
            </span>
          </div>

          {/* Race info */}
          <div className="flex-1 px-3 sm:px-6 py-4 sm:py-5 flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                {ongoingSession ? (
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase bg-red-600 text-white rounded tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-600/30 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE NOW: {ongoingSession.name}
                  </span>
                ) : isActive ? (
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-red-600 text-white rounded tracking-widest">
                    Active Weekend
                  </span>
                ) : null}
                {isCurrentWeekend && !isActive && !ongoingSession && (
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
              {ongoingSession ? (
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  Session in progress: {ongoingSession.name}
                </p>
              ) : !isPast && nextSession ? (
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">
                  Next: {nextSession.name} — {formatDate(nextSession.dateStr, mounted).full} {formatDate(nextSession.dateStr, mounted).time}
                </p>
              ) : null}
              {isPast && race.winner && (
                <div className="flex md:hidden items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Winner</span>
                  <span className="text-xs font-black text-zinc-300 italic">{race.winner.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center p-0.5 flex-shrink-0">
                      <TeamLogo teamName={race.winner.team} size={10} className="w-2.5 h-2.5 object-contain" />
                    </span>
                    <span className="text-[9px] font-medium text-zinc-400 font-mono">{race.winner.team}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Winner chip for past races (Desktop) */}
            {isPast && race.winner && (
              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest font-mono">Winner</span>
                  <span className="text-xs font-black text-white italic">{race.winner.name}</span>
                  <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
                    <span className="w-4 h-4 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center p-0.5 flex-shrink-0">
                      <TeamLogo teamName={race.winner.team} size={11} className="w-2.5 h-2.5 object-contain" />
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{race.winner.team}</span>
                  </div>
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
          {/* Race CTA: show View Results if past or in progress */}
          {(isPast || race.sessions.some((s) => new Date(s.dateStr) < now)) && (
            <div className="border-t border-zinc-800/30 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                {race.winner ? (
                  <div className="mb-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block">Race Winner</span>
                    <span className="text-base font-black italic text-white">{race.winner.name}</span>
                    <span className="text-xs text-zinc-500 font-mono ml-2">{race.winner.team}</span>
                  </div>
                ) : (
                  <div className="mb-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block">Race Weekend</span>
                    <span className="text-base font-black italic text-white">Session Results Available</span>
                  </div>
                )}
              </div>
              <Link
                href={`/race/${race.round}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase italic tracking-widest rounded-xl transition-colors flex-shrink-0"
              >
                {isPast ? "View Full Results" : "View Weekend Results"}
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
              const timing = checkSessionTiming(session.dateStr, session.name, now);
              const sDate = formatDate(session.dateStr, mounted);
              const isOngoing = timing.isOngoing;
              const sessionPast = timing.isPast;
              const isNextUp = !isOngoing && !sessionPast && globalNextSessionDateStr === session.dateStr;

              return (
                <div
                  key={idx}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                    ${isOngoing ? "border-red-500 bg-red-950/40 shadow-lg shadow-red-600/20 ring-1 ring-red-500/50" : ""}
                    ${sessionPast && !isOngoing ? "border-zinc-800/30 bg-zinc-900/20 opacity-70 hover:opacity-100 hover:border-zinc-700" : ""}
                    ${isNextUp && !isOngoing ? "border-red-600/50 bg-red-600/5" : ""}
                    ${!sessionPast && !isNextUp && !isOngoing ? "border-zinc-800/50 bg-zinc-900/30 hover:border-zinc-700" : ""}
                  `}
                >
                  {isOngoing && (
                    <span className="absolute -top-2 right-2 px-2 py-0.5 text-[8px] font-black uppercase bg-red-600 text-white rounded tracking-widest flex items-center gap-1 shadow-md shadow-red-600/50 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      ONGOING
                    </span>
                  )}
                  {isNextUp && !isOngoing && (
                    <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 text-[8px] font-black uppercase bg-red-600 text-white rounded tracking-widest">
                      up next
                    </span>
                  )}
                  <div className={`flex flex-col items-center justify-center border-r pr-3 min-w-[50px]
                    ${isOngoing ? "border-red-500/30" : sessionPast ? "border-zinc-800/30" : "border-zinc-800/60"}`}>
                    <span className={`text-[10px] font-bold uppercase ${isOngoing ? "text-red-400" : sessionPast ? "text-zinc-600" : "text-zinc-500"}`}>
                      {sDate.weekday}
                    </span>
                    <span className={`text-xl font-black italic leading-none ${isOngoing ? "text-red-200" : sessionPast ? "text-zinc-500" : "text-white"}`}>
                      {sDate.day}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-black uppercase tracking-tight truncate
                      ${isOngoing ? "text-white" : sessionPast ? "text-zinc-400" : isNextUp ? "text-red-400" : "text-zinc-300"}`}>
                      {session.name}
                    </span>
                    <span className={`text-xs font-mono ${isOngoing ? "text-red-300 font-bold" : sessionPast ? "text-zinc-600" : "text-zinc-500"}`}>
                      {sDate.time}
                    </span>
                  </div>
                  {isOngoing ? (
                    <Link
                      href={`/race/${race.round}?session=${getSessionSlug(session.name)}`}
                      className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 px-2.5 py-1.5 rounded-md transition-all flex-shrink-0 shadow-md shadow-red-600/30 animate-pulse"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Live
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  ) : sessionPast ? (
                    <Link
                      href={`/race/${race.round}?session=${getSessionSlug(session.name)}`}
                      className="ml-auto inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-400 hover:text-white bg-red-600/10 hover:bg-red-600 px-2 py-1 rounded-md transition-all flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Results
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  ) : null}
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
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const interval = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute the single globally next session across all races
  let globalNextSessionDateStr: string | null = null;
  for (const race of races) {
    for (const session of race.sessions) {
      const timing = checkSessionTiming(session.dateStr, session.name, now);
      if (timing.isUpcoming) {
        if (
          !globalNextSessionDateStr ||
          new Date(session.dateStr) < new Date(globalNextSessionDateStr)
        ) {
          globalNextSessionDateStr = session.dateStr;
        }
        break;
      }
    }
  }

  const filtered = races.filter((r) => {
    if (filter === "upcoming") return r.status !== "past";
    if (filter === "past") return r.status === "past";
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden">
      {/* Filter pills */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-2">
          {(["all", "upcoming", "past"] as const).map((f) => (
            <button
              key={f}
              id={`schedule-filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-black uppercase italic tracking-widest rounded-full border transition-all cursor-pointer ${
                filter === f
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-zinc-600 font-mono text-xs">
          {filtered.length} / {races.length} races
        </span>
      </div>

      {/* Race cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((race) => {
          const originalIdx = races.indexOf(race);
          return (
            <RaceCard
              key={race.round}
              race={race}
              isHighlighted={originalIdx === highlightIndex}
              mounted={mounted}
              globalNextSessionDateStr={globalNextSessionDateStr}
              now={now}
            />
          );
        })}
      </div>
    </div>
  );
}
