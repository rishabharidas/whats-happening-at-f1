"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TeamLogo from "@/components/TeamLogo";
import { LiveStatusData, EventPhase } from "@/utils/liveStatus";

interface HeroSectionProps {
  statusData: LiveStatusData | null;
}

export default function HeroSection({ statusData }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const heroStats = statusData?.heroStats;
  const featured = statusData?.featuredGrandPrix;
  const nextSession = statusData?.nextSession;
  const phase: EventPhase = statusData?.phase || "OUTSIDE_EVENT_WINDOW";
  const isLive = Boolean(statusData?.isLive && statusData?.activeSession);

  // Format timestamp into local user time
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

  // Calculate live countdown to target session or weekend
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

  const targetDateStr = nextSession?.dateStart || featured?.weekendStart;
  const countdown = getCountdown(targetDateStr);
  const targetFormatted = formatTime(targetDateStr);

  // Fallback high-resolution driver cutout images
  const defaultLeaderPhoto =
    heroStats?.wdcLeader?.headshotUrl ||
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/ANDANT01_Kimi_Antonelli/andant01.png.transform/4col/image.png";

  const defaultWinnerPhoto =
    heroStats?.latestWinner?.headshotUrl ||
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/4col/image.png";

  // Status badge config for Session Tracker Tile
  let statusBadgeLabel = "SCHEDULED TRACK ACTION";
  let statusBadgeColor = "text-zinc-400 bg-zinc-800/80 border-zinc-700/60";
  let statusIndicatorDot = "bg-zinc-400";
  let statusHeadline = nextSession?.sessionName || "Practice 1";
  let statusSubtext = `${targetFormatted.weekday}, ${targetFormatted.date} • ${targetFormatted.time}`;

  if (isLive) {
    statusBadgeLabel = "LIVE TRACK ACTION";
    statusBadgeColor = "text-white bg-red-600/90 border-red-500 shadow-sm shadow-red-600/30";
    statusIndicatorDot = "bg-white animate-ping";
    statusHeadline = statusData?.activeSession?.sessionName || "Active Session";
    statusSubtext = `${statusData?.activeSession?.raceName} • Live Telemetry`;
  } else if (phase === "UPCOMING_SESSION") {
    statusBadgeLabel = "STARTING SOON";
    statusBadgeColor = "text-amber-300 bg-amber-950/70 border-amber-600/60";
    statusIndicatorDot = "bg-amber-400 animate-pulse";
    statusHeadline = nextSession?.sessionName || "Upcoming Session";
    statusSubtext = `Green flag in ${countdown?.hours || 0}h ${countdown?.minutes || 0}m`;
  } else if (phase === "BETWEEN_SESSIONS") {
    statusBadgeLabel = "RACE WEEKEND ACTIVE";
    statusBadgeColor = "text-blue-300 bg-blue-950/70 border-blue-600/60";
    statusIndicatorDot = "bg-blue-400";
    statusHeadline = `Next: ${nextSession?.sessionName || "Track Session"}`;
    statusSubtext = `${targetFormatted.weekday} • ${targetFormatted.time}`;
  } else if (phase === "SESSION_COMPLETED") {
    statusBadgeLabel = "SESSION CONCLUDED";
    statusBadgeColor = "text-zinc-300 bg-zinc-800 border-zinc-700";
    statusIndicatorDot = "bg-zinc-400";
    statusHeadline = `${statusData?.recentSession?.sessionName || "Session"} Finished`;
    statusSubtext = "Classifications verified in Race Center";
  } else if (phase === "UNAVAILABLE_OR_STALE") {
    statusBadgeLabel = "DATA RECONNECTING";
    statusBadgeColor = "text-amber-400 bg-amber-950/60 border-amber-600/50";
    statusIndicatorDot = "bg-amber-500";
    statusHeadline = "Session Feed Offline";
    statusSubtext = "Check Race Center for cached timetable";
  }

  return (
    <section
      id="hero"
      aria-label="Formula 1 Live Hero"
      className="relative flex w-full flex-col items-center justify-start pt-2 sm:pt-4 pb-12 px-4 sm:px-6 md:px-8 bg-[#0a0a0a] text-white overflow-hidden"
    >
      {/* Subtle background track glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[500px] h-[280px] bg-red-600/25 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[380px] h-[220px] bg-teal-600/15 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-6">
        {/* COMPACT INTRO HEADER (Cleanly positioned with generous top clearance) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-zinc-400">
                WH@F1 // {heroStats?.season || "2026"} INTELLIGENCE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
              {"What's"} <span className="text-red-600">Happening</span>
              <span>@F1</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-sans text-zinc-400 max-w-xs sm:max-w-sm leading-relaxed sm:text-right">
            Live telemetry &amp; championship intelligence.
          </p>
        </div>

        {/* ========================================================= */}
        {/* MODULAR ASYMMETRIC BENTO GRID (Inspired by Reference Image)*/}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
          {/* ------------------------------------------------------- */}
          {/* ROW 1 - LEFT: WDC LEADER HERO TILE (Col Span 7)         */}
          {/* ------------------------------------------------------- */}
          <Link
            href="#drivers-standings"
            aria-label={`Championship Leader: ${heroStats?.wdcLeader?.fullName || "Andrea Kimi Antonelli"}`}
            className="group md:col-span-7 relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#00A19B] via-[#016f6b] to-[#043d3b] text-white shadow-2xl overflow-hidden min-h-[290px] sm:min-h-[320px] transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {/* Top Row: Subtitle Tag & Circular Arrow Button ↗ */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-white/80">
                Leader after Round {heroStats?.currentRound ? parseInt(heroStats.currentRound) - 1 : "17"} of {heroStats?.totalRounds || "23"}
              </span>
              <div
                aria-hidden="true"
                className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white group-hover:bg-white/25 group-hover:scale-105 transition-all shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Middle: Big Bold Driver Name */}
            <div className="relative z-10 my-auto max-w-[65%] sm:max-w-[60%]">
              <span className="text-base sm:text-xl font-bold uppercase tracking-tight text-white/90 block">
                {heroStats?.wdcLeader?.fullName.split(" ").slice(0, -1).join(" ") || "Andrea Kimi"}
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white leading-[0.9] drop-shadow-md">
                {heroStats?.wdcLeader?.fullName.split(" ").slice(-1)[0] || "ANTONELLI"}
              </h2>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-4 h-4 rounded-full bg-black/40 border border-white/20 flex items-center justify-center p-0.5 flex-shrink-0 backdrop-blur-sm">
                  <TeamLogo teamName={heroStats?.wdcLeader?.teamName || "Mercedes"} size={11} className="w-2.5 h-2.5 object-contain" />
                </span>
                <p className="text-xs sm:text-sm font-sans font-medium text-white/85 drop-shadow truncate">
                  {heroStats?.wdcLeader?.teamName || "Mercedes-AMG Petronas F1 Team"} • {heroStats?.wdcLeader?.points || "340"} PTS
                </p>
              </div>
            </div>

            {/* Bottom: Driver Number & Action Tag */}
            <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-white/80 uppercase">
                #{heroStats?.wdcLeader?.driverNumber || "12"} {heroStats?.wdcLeader?.driverCode || "ANT"}
              </span>
              <span className="text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                View Standings &rarr;
              </span>
            </div>

            {/* DRIVER CUTOUT PHOTO POPPING OUT ON THE RIGHT */}
            {defaultLeaderPhoto && (
              <div
                className="absolute right-[-4%] sm:right-[0%] bottom-0 w-[55%] sm:w-[48%] max-w-[280px] h-[95%] pointer-events-none select-none z-10 flex items-end justify-center"
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={defaultLeaderPhoto}
                  alt={heroStats?.wdcLeader?.fullName || "Driver"}
                  className="w-full h-full object-contain object-bottom filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
          </Link>

          {/* ------------------------------------------------------- */}
          {/* ROW 1 - RIGHT: NEXT GRAND PRIX CIRCUIT TILE (Col Span 5)*/}
          {/* ------------------------------------------------------- */}
          <Link
            href={featured?.round ? `/race/${featured.round}` : "#race-center"}
            aria-label={`Next Grand Prix: ${featured?.raceName || "United States Grand Prix"}`}
            className="group md:col-span-5 relative flex flex-col justify-between p-6 rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-red-600/60 shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden min-h-[290px] sm:min-h-[320px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {/* Top Row: Date Pill & Circular Arrow Button ↗ */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                23 - 25 OCT
              </span>
              <div
                aria-hidden="true"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 group-hover:scale-105 transition-all shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Center: Circuit Track Outline Silhouette */}
            <div className="relative z-10 my-auto py-2 flex items-center justify-center">
              {featured?.circuitImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.circuitImage}
                  alt={featured.circuit || "Circuit Map"}
                  className="w-full max-w-[220px] max-h-[140px] object-contain filter contrast-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs">
                  CIRCUIT
                </div>
              )}
            </div>

            {/* Bottom: Next GP Title & Lights-Out Countdown */}
            <div className="relative z-10 pt-3 border-t border-white/10 flex items-end justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                  Next GP • Round {featured?.round || "18"}
                </span>
                <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white leading-tight group-hover:text-red-500 transition-colors">
                  {featured?.raceName ? featured.raceName.replace("Grand Prix", "GP") : "United States GP"}
                </h3>
              </div>

              {/* Countdown Ticker with Hydration Safety */}
              {countdown && !countdown.passed && (
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-[9px] font-mono uppercase text-zinc-400">Lights Out</span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span
                      suppressHydrationWarning
                      className="text-base sm:text-lg font-black italic text-white"
                    >
                      {mounted ? `${String(countdown.days).padStart(2, "0")}d` : "--d"}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="text-base sm:text-lg font-black italic text-red-500"
                    >
                      {mounted ? `${String(countdown.hours).padStart(2, "0")}h` : "--h"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* ROW 2 - TILE 3: LATEST RACE WINNER (Col Span 4)         */}
          {/* ------------------------------------------------------- */}
          <Link
            href="/results"
            aria-label="Latest Race Winner"
            className="group md:col-span-4 relative flex flex-col justify-between p-5 rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-yellow-500/50 shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden min-h-[175px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
          >
            {/* Top Tag & Arrow */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-red-500 font-mono font-black text-xs">///</span>
                <span className="text-xs font-mono font-black uppercase text-yellow-400">
                  {heroStats?.latestWinner?.driverCode || "VER"}
                </span>
                <span className="text-[9px] font-mono uppercase text-zinc-400 ml-1 bg-white/5 px-2 py-0.5 rounded">
                  P1 Winner
                </span>
              </div>
              <div
                aria-hidden="true"
                className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:bg-yellow-500 group-hover:text-black group-hover:scale-105 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Middle: Winner Name & GP */}
            <div className="relative z-10 my-2 max-w-[65%]">
              <h3 className="text-xl font-black italic uppercase tracking-tight text-white group-hover:text-yellow-400 transition-colors truncate">
                {heroStats?.latestWinner?.fullName || "Max Verstappen"}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 truncate">
                <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center p-0.5 flex-shrink-0">
                  <TeamLogo teamName={heroStats?.latestWinner?.teamName || "Red Bull Racing"} size={10} className="w-2.5 h-2.5 object-contain" />
                </span>
                <p className="text-xs font-mono text-zinc-400 truncate">
                  {heroStats?.latestWinner?.raceName || "Singapore Grand Prix"}
                  {heroStats?.latestWinner?.teamName ? ` • ${heroStats.latestWinner.teamName}` : ""}
                </p>
              </div>
            </div>

            {/* Bottom: Mini Podium Finishers Pills */}
            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[9px] font-mono">
              {heroStats?.lastRacePodium && heroStats.lastRacePodium.length > 0 ? (
                heroStats.lastRacePodium.map((p) => (
                  <span
                    key={p.position}
                    className="px-2 py-0.5 rounded font-bold"
                    style={{
                      backgroundColor: `${p.teamColour}22`,
                      color: p.position === 1 ? "#FBBF24" : "#FFFFFF",
                      border: `1px solid ${p.teamColour}55`,
                    }}
                  >
                    P{p.position} {p.code}
                  </span>
                ))
              ) : (
                <span className="text-zinc-500">Official Podium Verified</span>
              )}
            </div>

            {/* DRIVER CUTOUT PEERING OUT ON RIGHT */}
            {defaultWinnerPhoto && (
              <div
                className="absolute right-[-4%] bottom-0 w-[42%] max-w-[130px] h-[92%] pointer-events-none select-none z-10 flex items-end justify-center"
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={defaultWinnerPhoto}
                  alt={heroStats?.latestWinner?.fullName || "Winner"}
                  className="w-full h-full object-contain object-bottom filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </Link>

          {/* ------------------------------------------------------- */}
          {/* ROW 2 - TILE 4: SESSION TRACKER TILE (Col Span 4)       */}
          {/* ------------------------------------------------------- */}
          <Link
            href="#race-center"
            aria-label={`Session Tracker: ${statusHeadline}`}
            className="group md:col-span-4 relative flex flex-col justify-between p-5 rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-red-600/50 shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden min-h-[175px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {/* Top: Status Badge & Arrow */}
            <div className="relative z-10 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusBadgeColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusIndicatorDot}`} />
                {statusBadgeLabel}
              </span>
              <div
                aria-hidden="true"
                className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:scale-105 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Middle: Session Headline & Local Time */}
            <div className="relative z-10 my-2">
              <h3 className="text-xl font-black italic uppercase tracking-tight text-white group-hover:text-red-400 transition-colors truncate">
                {statusHeadline}
              </h3>
              <p
                suppressHydrationWarning
                className="text-xs font-mono text-zinc-400 truncate mt-0.5"
              >
                {statusSubtext}
              </p>
            </div>

            {/* Bottom: Circuit Spec Tag */}
            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="truncate">{featured?.circuit || "Formula 1 Circuit"}</span>
              <span className="text-red-500 group-hover:text-white transition-colors flex-shrink-0">
                Track Center &rarr;
              </span>
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* ROW 2 - TILE 5: TITLE BATTLE STANDINGS (Col Span 4)     */}
          {/* ------------------------------------------------------- */}
          <Link
            href="#drivers-standings"
            aria-label="Championship Title Fight"
            className="group md:col-span-4 relative flex flex-col justify-between p-5 rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-cyan-500/50 shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden min-h-[175px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            {/* Top: Header & Arrow */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-mono font-black text-xs">///</span>
                <span className="text-xs font-mono font-black uppercase text-white">
                  2026 TITLE FIGHT
                </span>
              </div>
              <div
                aria-hidden="true"
                className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:bg-cyan-500 group-hover:text-black group-hover:scale-105 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Middle: Top 3 Driver Contenders with Player Photos */}
            <div className="relative z-10 my-2 flex items-center justify-between gap-2">
              {heroStats?.topStandings && heroStats.topStandings.length >= 3 ? (
                heroStats.topStandings.slice(0, 3).map((driver) => (
                  <div
                    key={driver.position}
                    className="flex flex-col items-center flex-1 bg-white/[0.03] border border-white/5 hover:border-white/20 p-2 rounded-xl transition-all"
                  >
                    <div className="relative w-9 h-9 rounded-full bg-zinc-800 border border-white/15 overflow-hidden mb-1 flex items-center justify-center">
                      {driver.headshotUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={driver.headshotUrl}
                          alt={driver.fullName}
                          className="w-full h-full object-cover object-top scale-110"
                        />
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-zinc-400">
                          {driver.driverCode}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-black italic uppercase text-white leading-none">
                      {driver.driverCode}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5 leading-none">
                      <TeamLogo teamName={driver.teamName} size={9} className="w-2 h-2 object-contain opacity-80" />
                      <span
                        className="text-[10px] font-mono font-bold"
                        style={{ color: driver.teamColour || "#ffffff" }}
                      >
                        {driver.points}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-2 text-xs font-mono text-zinc-400">
                  P1 Antonelli (340) • P2 Russell (238) • P3 Hamilton (229)
                </div>
              )}
            </div>

            {/* Bottom: Action Tag */}
            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>WDC Leaderboard</span>
              <span className="text-cyan-400 group-hover:text-white transition-colors">
                Full Standings &rarr;
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
