"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import TeamLogo from "@/components/TeamLogo";
import { LiveStatusData, EventPhase } from "@/utils/liveStatus";

interface HeroSectionProps {
  statusData: LiveStatusData | null;
}

export default function HeroSection({ statusData }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  const sectionRef = useRef<HTMLElement>(null);

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
  let statusBadgeLabel = "SCHEDULED";
  let statusBadgeColor = "text-zinc-400 bg-zinc-800/80 border-zinc-700/60";
  let statusIndicatorDot = "bg-zinc-400";
  let statusHeadline = nextSession?.sessionName || "Practice 1";
  let statusSubtext = `${targetFormatted.weekday}, ${targetFormatted.date} • ${targetFormatted.time}`;

  if (isLive) {
    statusBadgeLabel = "LIVE NOW";
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
    statusBadgeLabel = "RACE WEEKEND";
    statusBadgeColor = "text-blue-300 bg-blue-950/70 border-blue-600/60";
    statusIndicatorDot = "bg-blue-400";
    statusHeadline = `Next: ${nextSession?.sessionName || "Track Session"}`;
    statusSubtext = `${targetFormatted.weekday} • ${targetFormatted.time}`;
  } else if (phase === "SESSION_COMPLETED") {
    statusBadgeLabel = "CONCLUDED";
    statusBadgeColor = "text-zinc-300 bg-zinc-800 border-zinc-700";
    statusIndicatorDot = "bg-zinc-400";
    statusHeadline = `${statusData?.recentSession?.sessionName || "Session"} Finished`;
    statusSubtext = "Verified in Race Center";
  } else if (phase === "UNAVAILABLE_OR_STALE") {
    statusBadgeLabel = "OFFLINE";
    statusBadgeColor = "text-amber-400 bg-amber-950/60 border-amber-600/50";
    statusIndicatorDot = "bg-amber-500";
    statusHeadline = "Session Feed Offline";
    statusSubtext = "Check Race Center";
  }

  // GSAP Smooth Micro-Animations
  useEffect(() => {
    if (!mounted) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Header entrance
      gsap.from(".hero-anim-header", {
        opacity: 0,
        y: -12,
        duration: 0.6,
        ease: "power2.out",
      });

      // Bento cards staggered entrance
      gsap.from(".hero-anim-card", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });

      // Driver Cutout slide-in
      gsap.from(".hero-anim-driver", {
        opacity: 0,
        x: 30,
        duration: 0.85,
        delay: 0.15,
        ease: "power2.out",
        clearProps: "opacity,transform",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Formula 1 Live Hero"
      className="relative flex w-full flex-col items-center justify-start pt-2 sm:pt-4 pb-8 sm:pb-12 px-3 sm:px-6 md:px-8 bg-[#0a0a0a] text-white overflow-hidden"
    >
      {/* Subtle background track glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[500px] h-[280px] bg-red-600/25 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[380px] h-[220px] bg-teal-600/15 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6">
        {/* COMPACT INTRO HEADER */}
        <div className="hero-anim-header flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-800/80 pb-3 sm:pb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
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
          <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2">
            <p className="text-xs sm:text-sm font-sans text-zinc-400 max-w-xs sm:max-w-sm leading-relaxed sm:text-right hidden sm:block">
              Live telemetry &amp; championship intelligence.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 hover:bg-red-600/20 border border-zinc-700 hover:border-red-500/80 text-zinc-300 hover:text-white text-[11px] font-mono font-bold uppercase tracking-wider transition-all group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 group-hover:bg-red-400 animate-pulse" />
              <span>Explore The Paddock</span>
              <span className="text-zinc-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RESPONSIVE BENTO GRID                                     */}
        {/* Mobile: 2-column micro-grid layout (no 1-by-1 stack)     */}
        {/* Desktop: 12-column asymmetric bento grid                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4 w-full">
          {/* ------------------------------------------------------- */}
          {/* TILE 1: PRIMARY WDC CHAMPIONSHIP LEADER SHOWCASE        */}
          {/* Mobile: col-span-2 (Full Width) | Desktop: md:col-span-7 */}
          {/* ------------------------------------------------------- */}
          <Link
            href="#drivers-standings"
            aria-label={`Championship Leader: ${heroStats?.wdcLeader?.fullName || "Andrea Kimi Antonelli"}`}
            className="hero-anim-card group col-span-2 md:col-span-7 relative flex flex-col justify-between p-4 sm:p-7 rounded-2xl bg-gradient-to-br from-[#00A19B] via-[#016f6b] to-[#043d3b] text-white shadow-2xl overflow-hidden min-h-[200px] sm:min-h-[270px] md:min-h-[310px] transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {/* Top Row: Subtitle Tag & Circular Arrow Button */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[9px] sm:text-xs font-mono font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-white/80">
                Leader after Round {heroStats?.currentRound ? parseInt(heroStats.currentRound) - 1 : "17"} of {heroStats?.totalRounds || "23"}
              </span>
              <div
                aria-hidden="true"
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white group-hover:bg-white/25 group-hover:scale-105 transition-all shadow-md"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Middle: Driver Name & Constructor */}
            <div className="relative z-10 my-auto max-w-[62%] sm:max-w-[60%]">
              <span className="text-xs sm:text-xl font-bold uppercase tracking-tight text-white/90 block">
                {heroStats?.wdcLeader?.fullName.split(" ").slice(0, -1).join(" ") || "Andrea Kimi"}
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white leading-[0.9] drop-shadow-md">
                {heroStats?.wdcLeader?.fullName.split(" ").slice(-1)[0] || "ANTONELLI"}
              </h2>
              <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2">
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/40 border border-white/20 flex items-center justify-center p-0.5 flex-shrink-0 backdrop-blur-sm">
                  <TeamLogo teamName={heroStats?.wdcLeader?.teamName || "Mercedes"} size={11} className="w-2.5 h-2.5 object-contain" />
                </span>
                <p className="text-[11px] sm:text-sm font-sans font-medium text-white/85 drop-shadow truncate">
                  {heroStats?.wdcLeader?.teamName || "Mercedes-AMG Petronas F1 Team"} • {heroStats?.wdcLeader?.points || "340"} PTS
                </p>
              </div>
            </div>

            {/* Bottom: Driver Number & Action Tag */}
            <div className="relative z-10 pt-2 sm:pt-3 border-t border-white/20 flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-white/80 uppercase text-[10px] sm:text-xs">
                #{heroStats?.wdcLeader?.driverNumber || "12"} {heroStats?.wdcLeader?.driverCode || "ANT"}
              </span>
              <span className="text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[10px] sm:text-xs">
                View Standings &rarr;
              </span>
            </div>

            {/* DRIVER CUTOUT PHOTO POPPING OUT ON THE RIGHT */}
            {defaultLeaderPhoto && (
              <div
                className="hero-anim-driver absolute right-[-2%] sm:right-[0%] bottom-0 w-[48%] sm:w-[48%] max-w-[210px] sm:max-w-[270px] h-[95%] pointer-events-none select-none z-10 flex items-end justify-center"
                aria-hidden="true"
                style={{
                  maskImage: "linear-gradient(to bottom, black 72%, transparent 98%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 72%, transparent 98%)",
                }}
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
          {/* TILE 2: NEXT GRAND PRIX CIRCUIT TILE                    */}
          {/* Mobile: col-span-2 (Full Width) | Desktop: md:col-span-5 */}
          {/* ------------------------------------------------------- */}
          <Link
            href={featured?.round ? `/race/${featured.round}` : "#race-center"}
            aria-label={`Next Grand Prix: ${featured?.raceName || "United States Grand Prix"}`}
            className="hero-anim-card group col-span-2 md:col-span-5 relative flex flex-col justify-between p-4 sm:p-6 rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-red-600/60 shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden min-h-[190px] sm:min-h-[270px] md:min-h-[310px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-white/90 bg-white/10 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/10">
                23 - 25 OCT
              </span>
              <div
                aria-hidden="true"
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 group-hover:scale-105 transition-all shadow-md"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            <div className="relative z-10 my-auto py-1 sm:py-2 flex items-center justify-center">
              {featured?.circuitImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.circuitImage}
                  alt={featured.circuit || "Circuit Map"}
                  className="w-full max-w-[180px] sm:max-w-[220px] max-h-[90px] sm:max-h-[140px] object-contain filter contrast-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs">
                  CIRCUIT
                </div>
              )}
            </div>

            <div className="relative z-10 pt-2 sm:pt-3 border-t border-white/10 flex items-end justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-zinc-400 block truncate">
                  Next GP • Round {featured?.round || "18"}
                </span>
                <h3 className="text-base sm:text-xl md:text-2xl font-black italic uppercase tracking-tight text-white leading-tight group-hover:text-red-500 transition-colors truncate">
                  {featured?.raceName ? featured.raceName.replace("Grand Prix", "GP") : "United States GP"}
                </h3>
              </div>

              {countdown && !countdown.passed && (
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase text-zinc-400">Lights Out</span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span suppressHydrationWarning className="text-sm sm:text-base md:text-lg font-black italic text-white">
                      {mounted ? `${String(countdown.days).padStart(2, "0")}d` : "--d"}
                    </span>
                    <span suppressHydrationWarning className="text-sm sm:text-base md:text-lg font-black italic text-red-500">
                      {mounted ? `${String(countdown.hours).padStart(2, "0")}h` : "--h"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* TILE 3: LATEST RACE WINNER                              */}
          {/* Mobile: col-span-1 (Side-by-side) | Desktop: md:col-span-4 */}
          {/* ------------------------------------------------------- */}
          <Link
            href="/results"
            aria-label="Latest Race Winner"
            className="hero-anim-card group col-span-1 md:col-span-4 relative flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-yellow-500/50 shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden min-h-[160px] sm:min-h-[175px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-red-500 font-mono font-black text-[10px] sm:text-xs">///</span>
                <span className="text-[11px] sm:text-xs font-mono font-black uppercase text-yellow-400">
                  {heroStats?.latestWinner?.driverCode || "VER"}
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono uppercase text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
                  P1
                </span>
              </div>
              <div
                aria-hidden="true"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:bg-yellow-500 group-hover:text-black group-hover:scale-105 transition-all"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            <div className="relative z-10 my-1.5 sm:my-2 max-w-[85%] sm:max-w-[65%]">
              <h3 className="text-sm sm:text-lg md:text-xl font-black italic uppercase tracking-tight text-white group-hover:text-yellow-400 transition-colors truncate">
                {heroStats?.latestWinner?.fullName || "Max Verstappen"}
              </h3>
              <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1 truncate">
                <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center p-0.5 flex-shrink-0">
                  <TeamLogo teamName={heroStats?.latestWinner?.teamName || "Red Bull Racing"} size={10} className="w-2.5 h-2.5 object-contain" />
                </span>
                <p className="text-[10px] sm:text-xs font-mono text-zinc-400 truncate">
                  {heroStats?.latestWinner?.raceName ? heroStats.latestWinner.raceName.replace("Grand Prix", "GP") : "Singapore GP"}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] font-mono overflow-hidden">
              {heroStats?.lastRacePodium && heroStats.lastRacePodium.length > 0 ? (
                heroStats.lastRacePodium.map((p) => (
                  <span
                    key={p.position}
                    className="px-1.5 py-0.5 rounded font-bold whitespace-nowrap"
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
                <span className="text-zinc-500">Podium Verified</span>
              )}
            </div>

            {defaultWinnerPhoto && (
              <div
                className="absolute right-[-6%] sm:right-[-4%] bottom-0 w-[48%] sm:w-[42%] max-w-[130px] h-[90%] sm:h-[92%] pointer-events-none select-none z-10 flex items-end justify-center opacity-25 sm:opacity-100"
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
          {/* TILE 4: SESSION TRACKER TILE                            */}
          {/* Mobile: col-span-1 (Side-by-side) | Desktop: md:col-span-4 */}
          {/* ------------------------------------------------------- */}
          <Link
            href="#race-center"
            aria-label={`Session Tracker: ${statusHeadline}`}
            className="hero-anim-card group col-span-1 md:col-span-4 relative flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-red-600/50 shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden min-h-[160px] sm:min-h-[175px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <div className="relative z-10 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded border ${statusBadgeColor} truncate max-w-[75%]`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusIndicatorDot}`} />
                <span className="truncate">{statusBadgeLabel}</span>
              </span>
              <div
                aria-hidden="true"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:scale-105 transition-all flex-shrink-0"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            <div className="relative z-10 my-1 sm:my-2">
              <h3 className="text-sm sm:text-lg md:text-xl font-black italic uppercase tracking-tight text-white group-hover:text-red-400 transition-colors truncate">
                {statusHeadline}
              </h3>
              <p suppressHydrationWarning className="text-[10px] sm:text-xs font-mono text-zinc-400 truncate mt-0.5">
                {statusSubtext}
              </p>
            </div>

            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-zinc-400">
              <span className="truncate">{featured?.circuit ? featured.circuit.split(",")[0] : "Circuit"}</span>
              <span className="text-red-500 group-hover:text-white transition-colors flex-shrink-0 ml-1">
                Track &rarr;
              </span>
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* TILE 5: TITLE BATTLE STANDINGS                          */}
          {/* Mobile: col-span-2 (Full Width bar) | Desktop: md:col-span-4 */}
          {/* ------------------------------------------------------- */}
          <Link
            href="#drivers-standings"
            aria-label="Championship Title Fight"
            className="hero-anim-card group col-span-2 md:col-span-4 relative flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-cyan-500/50 shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden min-h-[160px] sm:min-h-[175px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-mono font-black text-[10px] sm:text-xs">///</span>
                <span className="text-[11px] sm:text-xs font-mono font-black uppercase text-white">
                  2026 TITLE FIGHT
                </span>
              </div>
              <div
                aria-hidden="true"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:bg-cyan-500 group-hover:text-black group-hover:scale-105 transition-all"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            <div className="relative z-10 my-1 sm:my-2 flex items-center justify-between gap-1.5 sm:gap-2">
              {heroStats?.topStandings && heroStats.topStandings.length >= 3 ? (
                heroStats.topStandings.slice(0, 3).map((driver) => (
                  <div
                    key={driver.position}
                    className="flex flex-col items-center flex-1 bg-white/[0.03] border border-white/5 hover:border-white/20 p-1.5 sm:p-2 rounded-xl transition-all"
                  >
                    <div className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-zinc-800 border border-white/15 overflow-hidden mb-1 flex items-center justify-center">
                      {driver.headshotUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={driver.headshotUrl}
                          alt={driver.fullName}
                          className="w-full h-full object-cover object-top scale-110"
                        />
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-zinc-400">
                          {driver.driverCode}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-black italic uppercase text-white leading-none">
                      {driver.driverCode}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5 leading-none">
                      <TeamLogo teamName={driver.teamName} size={9} className="w-2 h-2 object-contain opacity-80" />
                      <span
                        className="text-[9px] sm:text-[10px] font-mono font-bold"
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

            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-zinc-400">
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
