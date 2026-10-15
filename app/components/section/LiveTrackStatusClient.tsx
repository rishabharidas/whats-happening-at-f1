"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import TeamLogo from "@/components/TeamLogo";
import { LiveStatusData, EventPhase } from "@/utils/liveStatus";

export default function LiveTrackStatusClient({
  initialData,
}: {
  initialData: LiveStatusData | null;
}) {
  const [data, setData] = useState<LiveStatusData | null>(initialData);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  // Time ticker for countdown
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll for live data: every 20s if live, or every 60s if not live
  useEffect(() => {
    const pollInterval = data?.isLive ? 20000 : 60000;
    const intervalId = setInterval(() => {
      fetchLiveStatus();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [data?.isLive]);

  const fetchLiveStatus = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/live", { cache: "no-store" });
      if (res.ok) {
        const fresh = (await res.json()) as LiveStatusData;
        startTransition(() => {
          setData(fresh);
          setLastUpdated(new Date());
        });
      }
    } catch (e) {
      console.error("Failed to refresh live status", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format session date to local user time
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return { date: "-", time: "-", weekday: "-" };
    const d = new Date(dateStr);
    if (!mounted) {
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }),
        weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      };
    }
    return {
      date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      weekday: d.toLocaleDateString([], { weekday: "short" }),
    };
  };

  // Countdown calculation
  const getCountdown = (targetDateStr?: string) => {
    if (!targetDateStr) return null;
    const diff = new Date(targetDateStr).getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, passed: false };
  };

  const phase: EventPhase = data?.phase || "OUTSIDE_EVENT_WINDOW";
  const isLive = Boolean(data?.isLive && data?.activeSession);
  const activeSession = isLive ? data?.activeSession : null;
  const featured = data?.featuredGrandPrix;

  // Primary target for countdown: next scheduled session, or featured race start
  const targetDateStr =
    phase === "LIVE_SESSION"
      ? undefined
      : data?.nextSession?.dateStart || featured?.weekendStart;

  const countdown = getCountdown(targetDateStr);
  const nextFormatted = formatTime(targetDateStr);

  return (
    <div id="race-center" className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-2 font-sans scroll-mt-24">
      {/* SECTION HEADER & EVENT-AWARE STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-4 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-7 w-1 bg-red-600 rounded-full" />
          <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tighter">
            Race <span className="text-red-600">Center</span>
          </h2>

          {/* REAL-TIME EVENT-AWARE BADGE */}
          {phase === "LIVE_SESSION" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-600/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              LIVE ON TRACK
            </span>
          ) : phase === "UPCOMING_SESSION" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase tracking-widest rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              PIT LANE OPENS SOON
            </span>
          ) : phase === "BETWEEN_SESSIONS" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/60 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              BETWEEN SESSIONS
            </span>
          ) : phase === "SESSION_COMPLETED" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-black uppercase tracking-widest rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              SESSION CONCLUDED
            </span>
          ) : phase === "UNAVAILABLE_OR_STALE" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest rounded-full font-mono">
              FEED OFFLINE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              UPCOMING GP
            </span>
          )}
        </div>

        {/* Action & Refresh Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={fetchLiveStatus}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
            title="Refresh timing status"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-500" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">
              {mounted
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "Refresh"}
            </span>
          </button>

          <Link
            href="/schedule"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-mono transition-colors"
          >
            <span>Full 2026 Calendar</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CASE 1: ONGOING LIVE SESSION (Telemetry & Timing Tower)              */}
      {/* ==================================================================== */}
      {isLive && activeSession ? (
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900/90 to-zinc-900/60 border border-red-600/40 p-6 md:p-8 shadow-2xl shadow-red-600/10">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-red-500 font-mono text-xs font-black uppercase tracking-[0.25em]">
                    Active Track Session
                  </span>
                </div>

                <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                  {activeSession.raceName}
                </h3>
                <p className="text-xl md:text-2xl font-bold uppercase text-red-400 italic mt-1">
                  {activeSession.sessionName}
                </p>
                <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mt-2">
                  {activeSession.circuit} • {activeSession.country}
                </p>
              </div>

              {/* LIVE TELEMETRY TILES */}
              {data?.weather && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Air Temp</span>
                    <span className="text-lg font-black font-mono text-white">
                      {data.weather.airTemp !== null ? `${data.weather.airTemp.toFixed(1)}°C` : "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Track Temp</span>
                    <span className="text-lg font-black font-mono text-red-400">
                      {data.weather.trackTemp !== null ? `${data.weather.trackTemp.toFixed(1)}°C` : "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Humidity</span>
                    <span className="text-lg font-black font-mono text-white">
                      {data.weather.humidity !== null ? `${Math.round(data.weather.humidity)}%` : "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Surface</span>
                    <span
                      className={`text-lg font-black font-mono ${data.weather.rainfall ? "text-blue-400" : "text-emerald-400"}`}
                    >
                      {data.weather.rainfall ? "WET" : "DRY"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LIVE LEADERBOARD / TIMING TOWER */}
          {data?.leaderboard && data.leaderboard.length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">
                    Live Timing Tower (Top 10)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  Auto-Updating
                </span>
              </div>

              <div className="divide-y divide-zinc-800/50">
                {data.leaderboard.map((driver) => (
                  <div
                    key={driver.driverNumber}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-[50px]">
                      <span
                        className={`text-sm font-black font-mono italic w-6 text-center ${
                          driver.position === 1
                            ? "text-yellow-400"
                            : driver.position <= 3
                              ? "text-zinc-200"
                              : "text-zinc-500"
                        }`}
                      >
                        P{driver.position}
                      </span>
                      <div
                        className="w-1.5 h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: driver.teamColour }}
                      />
                    </div>

                    <div className="flex items-center gap-3 flex-1 min-w-0 px-2">
                      {driver.headshotUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={driver.headshotUrl}
                          alt={driver.fullName}
                          className="w-8 h-8 rounded-full object-cover bg-zinc-800 flex-shrink-0 border border-zinc-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-mono text-xs text-zinc-400 font-bold border border-zinc-700 flex-shrink-0">
                          {driver.code}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white uppercase italic truncate">
                            {driver.fullName}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-zinc-500">
                            #{driver.driverNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center p-0.5 flex-shrink-0">
                            <TeamLogo teamName={driver.teamName} size={10} className="w-2.5 h-2.5 object-contain" />
                          </span>
                          <span className="text-xs text-zinc-400 font-mono truncate">
                            {driver.teamName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-right flex-shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] uppercase text-zinc-500 tracking-wider">Gap</span>
                        <span
                          className={`text-xs font-bold ${driver.position === 1 ? "text-yellow-400" : "text-white"}`}
                        >
                          {driver.gapToLeader}
                        </span>
                      </div>
                      <div className="hidden sm:flex flex-col items-end w-16">
                        <span className="text-[9px] uppercase text-zinc-500 tracking-wider">Interval</span>
                        <span className="text-xs text-zinc-400 font-bold">{driver.interval}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {activeSession.round && (
                <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">Official OpenF1 timing feed</span>
                  <Link
                    href={`/race/${activeSession.round}`}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-red-500 hover:text-white transition-colors"
                  >
                    <span>Full Race Weekend Hub</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ==================================================================== */
        /* CASE 2: UPCOMING GRAND PRIX / BETWEEN SESSIONS (Event Hub)           */
        /* ==================================================================== */
        <div className="flex flex-col gap-8">
          {/* FEATURED EVENT HERO CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 md:p-8 transition-all hover:border-zinc-700">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] pointer-events-none rounded-full" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Event Context & Lights Out Countdown */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {phase === "BETWEEN_SESSIONS"
                        ? "Active Race Weekend"
                        : phase === "UPCOMING_SESSION"
                          ? "Upcoming Track Session"
                          : `Round ${featured?.round || "18"} of 24`}
                    </span>
                    {targetDateStr && (
                      <span className="text-xs font-mono text-zinc-400">
                        {nextFormatted.weekday}, {nextFormatted.date} • {nextFormatted.time} (Your Time)
                      </span>
                    )}
                  </div>

                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                    {featured?.raceName || data?.nextSession?.raceName || "Formula 1 Grand Prix"}
                  </h3>

                  <p className="text-lg sm:text-xl font-bold uppercase text-red-500 italic mt-1">
                    {data?.nextSession?.sessionName || "Race Weekend"}
                  </p>

                  <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                    <span>
                      {featured?.circuit || data?.nextSession?.circuit} • {featured?.location || data?.nextSession?.location}, {featured?.country || data?.nextSession?.country}
                    </span>
                  </p>
                </div>

                {/* COUNTDOWN DIGITS */}
                {countdown && !countdown.passed && (
                  <div className="mt-8 pt-6 border-t border-zinc-800/80">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-3">
                      {phase === "UPCOMING_SESSION"
                        ? "Green Flag Countdown"
                        : "Track Action Begins In"}
                    </span>
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md">
                      <div className="flex flex-col items-center bg-black/40 border border-zinc-800 p-2 sm:p-3 rounded-xl min-w-0">
                        <span
                          suppressHydrationWarning
                          className="text-xl sm:text-3xl md:text-4xl font-black font-mono italic text-white leading-none"
                        >
                          {mounted ? String(countdown.days).padStart(2, "0") : "--"}
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
                          Days
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-black/40 border border-zinc-800 p-2 sm:p-3 rounded-xl min-w-0">
                        <span
                          suppressHydrationWarning
                          className="text-xl sm:text-3xl md:text-4xl font-black font-mono italic text-white leading-none"
                        >
                          {mounted ? String(countdown.hours).padStart(2, "0") : "--"}
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
                          Hours
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-black/40 border border-zinc-800 p-2 sm:p-3 rounded-xl min-w-0">
                        <span
                          suppressHydrationWarning
                          className="text-xl sm:text-3xl md:text-4xl font-black font-mono italic text-white leading-none"
                        >
                          {mounted ? String(countdown.minutes).padStart(2, "0") : "--"}
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
                          Mins
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-black/40 border border-red-900/40 p-2 sm:p-3 rounded-xl min-w-0">
                        <span
                          suppressHydrationWarning
                          className="text-xl sm:text-3xl md:text-4xl font-black font-mono italic text-red-500 leading-none"
                        >
                          {mounted ? String(countdown.seconds).padStart(2, "0") : "--"}
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
                          Secs
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Track Outline & Flag */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-xl relative overflow-hidden min-h-[220px]">
                {featured?.circuitImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.circuitImage}
                    alt={featured.circuit}
                    className="w-full max-w-[260px] h-auto max-h-[180px] object-contain opacity-75 drop-shadow-2xl filter contrast-125"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs">
                    CIRCUIT
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between w-full px-2 pt-3 border-t border-zinc-800/60 text-xs font-mono">
                  <span className="text-zinc-500 uppercase">{featured?.location || "Grand Prix"}</span>
                  {featured?.round && (
                    <Link
                      href={`/race/${featured.round}`}
                      className="text-red-500 hover:text-white font-bold uppercase transition-colors"
                    >
                      Race Weekend Hub &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FULL WEEKEND TIMETABLE & COMPLETED SESSION RECAP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TIMETABLE (Span 2) */}
            <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Weekend Session Timetable
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Times in your local timezone
                </span>
              </div>

              <div className="divide-y divide-zinc-800/60">
                {featured?.sessions && featured.sessions.length > 0 ? (
                  featured.sessions.map((session, idx) => {
                    const sTime = formatTime(session.dateStart);
                    const isNext = data?.nextSession?.sessionName === session.sessionName;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between py-3 px-3 rounded-lg transition-colors ${
                          isNext ? "bg-red-950/20 border border-red-800/40" : "hover:bg-zinc-800/30"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-zinc-500 w-10">
                            {sTime.weekday}
                          </span>
                          <div className="flex flex-col">
                            <span
                              className={`text-sm font-black uppercase italic ${
                                isNext ? "text-red-400" : "text-white"
                              }`}
                            >
                              {session.sessionName}
                            </span>
                            <span className="text-xs font-mono text-zinc-400">
                              {sTime.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-mono font-bold text-zinc-200">
                            {sTime.time}
                          </span>
                          {session.status === "past" ? (
                            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[9px] font-mono uppercase">
                              Done
                            </span>
                          ) : isNext ? (
                            <span className="px-2 py-0.5 bg-red-600/80 text-white rounded text-[9px] font-mono font-bold uppercase animate-pulse">
                              Next Up
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded text-[9px] font-mono uppercase">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-zinc-500 text-xs font-mono">
                    Schedule details being verified.
                  </div>
                )}
              </div>
            </div>

            {/* RECENT SESSION RECAP CARD */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 font-mono block mb-3">
                  Previous Grand Prix Recap
                </span>
                {data?.recentSession ? (
                  <>
                    <h4 className="text-xl font-black italic uppercase text-white tracking-tight">
                      {data.recentSession.raceName}
                    </h4>
                    <p className="text-sm font-bold text-red-400 italic mt-0.5">
                      {data.recentSession.sessionName} Concluded
                    </p>
                    <p className="text-zinc-500 font-mono text-xs mt-2">
                      {data.recentSession.circuit} • {data.recentSession.country}
                    </p>

                    <div className="mt-6 pt-4 border-t border-zinc-800/80">
                      <Link
                        href={`/race/${data.recentSession.round}`}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-zinc-300 hover:text-white transition-colors"
                      >
                        <span>View Race Analysis</span>
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-zinc-400 text-sm">
                    Season underway. Track results will display as sessions finish.
                  </p>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500">2026 Season Hub</span>
                <Link
                  href="/results"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-black uppercase italic tracking-widest transition-colors"
                >
                  <span>Results Archive</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
