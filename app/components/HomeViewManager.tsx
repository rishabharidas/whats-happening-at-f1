"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import TeamLogo from "@/components/TeamLogo";
import CircuitGraphic from "@/components/CircuitGraphic";
import DriverGraphic from "@/components/DriverGraphic";
import { LiveStatusData, EventPhase } from "@/utils/liveStatus";
import { checkSessionTiming } from "@/utils/sessionTiming";

interface NewsItem {
  title: string;
  url?: string;
  publishedAt?: string;
  source?: {
    name?: string;
  };
}

interface HomeViewProps {
  statusData: LiveStatusData | null;
  newsArticles?: NewsItem[];
}

export default function HomeViewManager({
  statusData,
  newsArticles = [],
}: HomeViewProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  // Independent shutter states for each tile: true = Face 2, false = Face 1
  const [shutteredTiles, setShutteredTiles] = useState<Record<string, boolean>>({
    wdc: false,
    nextGp: false,
    liveCenter: false,
    winner: false,
    duel: false,
    news: false,
    radio: false,
    lexicon: false,
  });

  const hoveredTileRef = useRef<string | null>(null);
  const hoverDwellTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const hoverRevertTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dwellTimers = hoverDwellTimersRef.current;
    const revertTimers = hoverRevertTimersRef.current;
    const mountTimer = setTimeout(() => setMounted(true), 0);
    const tickInterval = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(mountTimer);
      clearInterval(tickInterval);
      Object.values(dwellTimers).forEach(clearTimeout);
      Object.values(revertTimers).forEach(clearTimeout);
    };
  }, []);

  // Hover triggers: 1.1s dwell delay to prevent jitter, plus 6s auto-revert to original position
  const handleTileEnter = useCallback((key: string) => {
    hoveredTileRef.current = key;

    // Clear any previous dwell or revert timers for this tile
    if (hoverDwellTimersRef.current[key]) {
      clearTimeout(hoverDwellTimersRef.current[key]);
      delete hoverDwellTimersRef.current[key];
    }
    if (hoverRevertTimersRef.current[key]) {
      clearTimeout(hoverRevertTimersRef.current[key]);
      delete hoverRevertTimersRef.current[key];
    }

    // Require mouse to dwell on the tile for 1100ms before shuttering
    hoverDwellTimersRef.current[key] = setTimeout(() => {
      if (hoveredTileRef.current === key) {
        setShutteredTiles((prev) => ({ ...prev, [key]: true }));

        // Automatically revert back to Face 1 after 6 seconds
        hoverRevertTimersRef.current[key] = setTimeout(() => {
          setShutteredTiles((prev) => ({ ...prev, [key]: false }));
        }, 6000);
      }
    }, 1100);
  }, []);

  const handleTileLeave = useCallback((key: string) => {
    if (hoveredTileRef.current === key) {
      hoveredTileRef.current = null;
    }
    // Cancel pending dwell shutter
    if (hoverDwellTimersRef.current[key]) {
      clearTimeout(hoverDwellTimersRef.current[key]);
      delete hoverDwellTimersRef.current[key];
    }
    // Cancel pending auto-revert
    if (hoverRevertTimersRef.current[key]) {
      clearTimeout(hoverRevertTimersRef.current[key]);
      delete hoverRevertTimersRef.current[key];
    }
    // Smoothly restore back to original state (Face 1)
    setShutteredTiles((prev) => ({ ...prev, [key]: false }));
  }, []);

  // Random Shutter Animation:
  // Random tiles randomly shutter across the grid, stay for ~3.5s, then revert back
  useEffect(() => {
    if (!mounted) return;

    const tileKeys = ["wdc", "nextGp", "liveCenter", "winner", "duel", "news", "radio", "lexicon"];
    let timeoutId: NodeJS.Timeout;

    const scheduleRandomShutter = () => {
      // Random delay between 2500ms and 5500ms
      const delay = Math.floor(Math.random() * 3000) + 2500;

      timeoutId = setTimeout(() => {
        // Pick a random tile that is NOT currently hovered by the user
        const available = tileKeys.filter((k) => k !== hoveredTileRef.current);
        if (available.length > 0) {
          const randomKey = available[Math.floor(Math.random() * available.length)];

          // Shutter this tile
          setShutteredTiles((prev) => ({ ...prev, [randomKey]: true }));

          // Revert back after 3.5s (unless user is currently hovering over it)
          setTimeout(() => {
            if (hoveredTileRef.current !== randomKey) {
              setShutteredTiles((prev) => ({ ...prev, [randomKey]: false }));
            }
          }, 3500);
        }

        // Loop next random shutter
        scheduleRandomShutter();
      }, delay);
    };

    scheduleRandomShutter();

    return () => clearTimeout(timeoutId);
  }, [mounted]);

  const heroStats = statusData?.heroStats;
  const featured = statusData?.featuredGrandPrix;
  const nextSession = statusData?.nextSession;
  const phase: EventPhase = statusData?.phase || "OUTSIDE_EVENT_WINDOW";
  const isLive = Boolean(statusData?.isLive && statusData?.activeSession);

  // Top 4 Championship Contenders (synchronized with /standings)
  const topContenders =
    heroStats?.topStandings && heroStats.topStandings.length >= 2
      ? heroStats.topStandings.slice(0, 4)
      : [
          {
            position: 1,
            fullName: "Max Verstappen",
            driverCode: "VER",
            driverNumber: "1",
            teamName: "Red Bull Racing",
            teamColour: "#3671C6",
            points: "393",
            headshotUrl:
              "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/4col/image.png",
          },
          {
            position: 2,
            fullName: "Lando Norris",
            driverCode: "NOR",
            driverNumber: "4",
            teamName: "McLaren",
            teamColour: "#FF8000",
            points: "331",
            headshotUrl:
              "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/4col/image.png",
          },
          {
            position: 3,
            fullName: "Charles Leclerc",
            driverCode: "LEC",
            driverNumber: "16",
            teamName: "Ferrari",
            teamColour: "#E80020",
            points: "307",
            headshotUrl:
              "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/4col/image.png",
          },
          {
            position: 4,
            fullName: "Oscar Piastri",
            driverCode: "PIA",
            driverNumber: "81",
            teamName: "McLaren",
            teamColour: "#FF8000",
            points: "262",
            headshotUrl:
              "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/4col/image.png",
          },
        ];

  // Live countdown
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

  // Check session completion according to clock time
  const hasLeaderboard = Boolean(statusData?.leaderboard && statusData.leaderboard.length > 0);
  const hasWeather = Boolean(statusData?.weather?.trackTemp != null);
  const hasTelemetry = hasLeaderboard || hasWeather;

  const recentTiming = statusData?.recentSession?.dateStart
    ? checkSessionTiming(statusData.recentSession.dateStart, statusData.recentSession.sessionName, now)
    : null;

  const nextTiming = nextSession?.dateStart
    ? checkSessionTiming(nextSession.dateStart, nextSession.sessionName, now)
    : null;

  // Status badge config
  let statusBadgeLabel = "SCHEDULED";
  let statusBadgeColor = "text-zinc-400 bg-zinc-800/80 border-zinc-700/60";
  let statusIndicatorDot = "bg-zinc-400";
  let statusHeadline = nextSession?.sessionName || "Practice 1";
  let statusSubtext = "Scheduled session";

  if (isLive) {
    statusBadgeLabel = "LIVE NOW";
    statusBadgeColor = "text-white bg-red-600/90 border-red-500 shadow-sm shadow-red-600/30";
    statusIndicatorDot = "bg-white animate-ping";
    statusHeadline = statusData?.activeSession?.sessionName || "Active Session";
    statusSubtext = `${statusData?.activeSession?.raceName || "Grand Prix"} • Live Timing`;
  } else if (nextTiming?.isOngoing && !hasTelemetry) {
    // Session is running on clock, but no telemetry received yet
    statusBadgeLabel = "NO DATA RECEIVED";
    statusBadgeColor = "text-amber-300 bg-amber-950/70 border-amber-600/60";
    statusIndicatorDot = "bg-amber-400 animate-pulse";
    statusHeadline = `${nextSession?.sessionName || "Session"} In Progress`;
    statusSubtext = "No live telemetry received so far";
  } else if (
    phase === "SESSION_COMPLETED" ||
    (recentTiming?.isPast && (now.getTime() - recentTiming.endTime.getTime()) <= 36 * 3600 * 1000)
  ) {
    // Session completed according to clock time
    const sessionName = statusData?.recentSession?.sessionName || "Session";
    const raceName = statusData?.recentSession?.raceName?.replace("Grand Prix", "GP") || "Grand Prix";
    if (!hasTelemetry) {
      statusBadgeLabel = "NO DATA RECEIVED";
      statusBadgeColor = "text-amber-300 bg-amber-950/70 border-amber-600/60";
      statusIndicatorDot = "bg-amber-400";
      statusHeadline = `${raceName} ${sessionName} Concluded`;
      statusSubtext = "No timing data received so far • Results pending";
    } else {
      statusBadgeLabel = "CONCLUDED";
      statusBadgeColor = "text-zinc-300 bg-zinc-800 border-zinc-700";
      statusIndicatorDot = "bg-zinc-400";
      statusHeadline = `${raceName} ${sessionName} Finished`;
      statusSubtext = "Official results published";
    }
  } else if (
    phase === "UPCOMING_SESSION" ||
    (nextTiming && nextTiming.startTime.getTime() - now.getTime() <= 3 * 3600 * 1000 && nextTiming.startTime.getTime() - now.getTime() > 0)
  ) {
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
    statusSubtext = `${featured?.raceName?.replace("Grand Prix", "GP") || "Grand Prix"} • Scheduled`;
  } else if (phase === "UNAVAILABLE_OR_STALE") {
    statusBadgeLabel = "OFFLINE";
    statusBadgeColor = "text-amber-400 bg-amber-950/60 border-amber-600/50";
    statusIndicatorDot = "bg-amber-500";
    statusHeadline = "Session Feed Offline";
    statusSubtext = "Check Race Center";
  } else {
    statusBadgeLabel = "SCHEDULED";
    statusBadgeColor = "text-zinc-400 bg-zinc-800/80 border-zinc-700/60";
    statusIndicatorDot = "bg-zinc-400";
    statusHeadline = `Next: ${nextSession?.sessionName || "Practice 1"}`;
    statusSubtext = `${featured?.raceName?.replace("Grand Prix", "GP") || "São Paulo GP"} • Round ${featured?.round || "19"}`;
  }

  // Driver leader resolution
  const leaderDriver = heroStats?.wdcLeader || topContenders[0];
  const runnerUpDriver = topContenders[1];
  const leaderPts = Number(leaderDriver?.points || 0);
  const runnerUpPts = Number(runnerUpDriver?.points || 0);
  const leaderLead = Math.max(0, leaderPts - runnerUpPts);
  const leaderGivenName = leaderDriver?.fullName ? leaderDriver.fullName.split(" ").slice(0, -1).join(" ") : "Max";
  const leaderSurname = leaderDriver?.fullName ? leaderDriver.fullName.split(" ").slice(-1)[0] : "VERSTAPPEN";
  const leaderTeam = leaderDriver?.teamName || "Red Bull Racing";
  const leaderHex = leaderDriver?.teamColour || "#3671C6";

  // Driver cutout photos
  const leaderPhoto =
    leaderDriver?.headshotUrl ||
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/4col/image.png";

  const winnerPhoto =
    heroStats?.latestWinner?.headshotUrl ||
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/4col/image.png";

  // Staggered cascade entrance on mount
  useEffect(() => {
    if (!mounted) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".metro-tile", {
        opacity: 0,
        y: 16,
        duration: 0.4,
        stagger: 0.03,
        ease: "power2.out",
        clearProps: "all",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [mounted]);

  // Clean news headlines
  const headlineA = newsArticles[0]?.title || "Mercedes confirm new floor upgrade package for Austin";
  const sourceA = newsArticles[0]?.source?.name || "Formula 1";
  const headlineB = newsArticles[1]?.title || "Sainz seals commanding victory in Mexico City Grand Prix";
  const sourceB = newsArticles[1]?.source?.name || "Autosport";

  return (
    <div
      ref={containerRef}
      id="hero"
      className="w-full flex flex-col items-center px-3 sm:px-5 pt-1 sm:pt-2 pb-6 sm:pb-8"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-3 sm:gap-3.5">
        {/* ========================================================= */}
        {/* CLEAN, MINIMAL HEADER BAR (WINDOWS 8 STYLE)               */}
        {/* ========================================================= */}
        <header className="flex items-center justify-between px-3 sm:px-4 py-2 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
            <h1 className="text-sm sm:text-base font-black italic uppercase tracking-tight text-white leading-none">
              {"What's"} <span className="text-red-600">Happening</span>
              <span>@F1</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
            <span className="text-[10px] sm:text-xs text-zinc-400">
              Round {featured?.round || "19"} • {featured?.raceName ? featured.raceName.replace("Grand Prix", "GP") : "São Paulo GP"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>
        </header>

        {/* ========================================================= */}
        {/* WINDOWS 8 LIVE TILES GRID                                 */}
        {/* Push-Shutter on Hover & Random Periodic Push Transition   */}
        {/* ========================================================= */}
        <main className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-3.5 w-full">
          {/* ------------------------------------------------------- */}
          {/* TILE 1: CHAMPIONSHIP LEADER                             */}
          {/* ------------------------------------------------------- */}
          <Link
            href="/standings"
            onMouseEnter={() => handleTileEnter("wdc")}
            onMouseLeave={() => handleTileLeave("wdc")}
            className="metro-tile group col-span-2 md:col-span-7 relative rounded-2xl bg-gradient-to-br from-[#00827b] via-[#015f5a] to-[#013532] text-white shadow-lg overflow-hidden min-h-[210px] sm:min-h-[260px] border border-white/20 hover:border-cyan-300/60 transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            {/* Face 1: Cutout & Name */}
            <div
              className={`absolute inset-0 p-4 sm:p-6 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.wdc ? "-translate-y-full" : "translate-y-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-cyan-200">
                  P1 Leader
                </span>
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">&rarr;</span>
              </div>

              <div className="my-auto max-w-[60%]">
                <span className="text-xs sm:text-base font-bold uppercase tracking-tight text-white/90 block">
                  {leaderGivenName}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                  {leaderSurname}
                </h2>
                <div className="flex items-center gap-1.5 mt-2">
                  <TeamLogo teamName={leaderTeam} size={12} className="w-3 h-3 object-contain" />
                  <span className="text-xs sm:text-sm font-sans text-white/90">
                    {leaderTeam} • {leaderDriver?.points || "393"} PTS
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-white/80">
                <span className="font-bold uppercase tracking-wider text-[11px]">Standings</span>
                <span>View Full Sheet &rarr;</span>
              </div>

              <div
                className="absolute right-[-2%] bottom-0 w-[45%] max-w-[220px] h-[95%] pointer-events-none select-none flex items-end justify-center overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent 0%, black 30%, black 100%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%, black 100%)",
                }}
                aria-hidden="true"
              >
                <DriverGraphic
                  headshotUrl={leaderPhoto}
                  fullName={leaderDriver?.fullName || "Max Verstappen"}
                  code={leaderDriver?.driverCode || "VER"}
                  driverNumber={leaderDriver?.driverNumber || 1}
                  teamName={leaderTeam}
                  teamColour={leaderHex}
                  variant="portrait"
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Face 2: What It Is (Clean Shutter Face) */}
            <div
              className={`absolute inset-0 p-4 sm:p-6 bg-[#042826] flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.wdc ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-cyan-300">
                  Drivers&apos; Championship
                </span>
                <span className="text-xs text-white/70">&rarr;</span>
              </div>

              <div className="my-auto">
                <div className="text-3xl sm:text-5xl font-black italic text-white leading-none mb-1">
                  {leaderDriver?.points || "393"} <span className="text-sm font-mono text-cyan-300 font-bold">PTS</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black italic uppercase text-white">
                  {leaderDriver?.fullName || "Max Verstappen"}
                </h3>
                <p className="text-xs sm:text-sm text-cyan-100/80 mt-1">
                  1st in World Championship • {leaderTeam} {leaderLead > 0 ? `(+${leaderLead} PTS Lead)` : ""}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                <span className="font-bold uppercase tracking-wider text-[11px]">Standings</span>
                <span>Open Leaderboard &rarr;</span>
              </div>
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* TILE 2: NEXT GRAND PRIX & COUNTDOWN                     */}
          {/* ------------------------------------------------------- */}
          <Link
            href="/schedule"
            onMouseEnter={() => handleTileEnter("nextGp")}
            onMouseLeave={() => handleTileLeave("nextGp")}
            className="metro-tile group col-span-2 md:col-span-5 relative rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-red-600/60 shadow-lg overflow-hidden min-h-[210px] sm:min-h-[260px] transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            {/* Face 1: Circuit Graphic & Timer */}
            <div
              className={`absolute inset-0 p-4 sm:p-6 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.nextGp ? "-translate-y-full" : "translate-y-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-red-400">
                  Next Grand Prix
                </span>
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">&rarr;</span>
              </div>

              <div className="my-auto py-1 flex items-center justify-center">
                <CircuitGraphic
                  circuitImage={featured?.circuitImage}
                  circuitName={featured?.circuit}
                  circuitLocation={featured?.location}
                  raceName={featured?.raceName}
                  variant="hero"
                  className="w-full max-w-[170px] sm:max-w-[220px] max-h-[85px] sm:max-h-[115px]"
                />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black italic uppercase tracking-tight text-white leading-tight">
                    {featured?.raceName ? featured.raceName.replace("Grand Prix", "GP") : "São Paulo GP"}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400 block">{featured?.location || "São Paulo, Brazil"}</span>
                </div>

                {countdown && !countdown.passed && (
                  <div className="flex items-center gap-1 font-mono text-xs text-white">
                    <span suppressHydrationWarning className="font-bold">{mounted ? String(countdown.days).padStart(2, "0") : "--"}d</span>
                    <span className="text-red-500">:</span>
                    <span suppressHydrationWarning className="font-bold">{mounted ? String(countdown.hours).padStart(2, "0") : "--"}h</span>
                    <span className="text-red-500">:</span>
                    <span suppressHydrationWarning className="font-bold text-red-400">{mounted ? String(countdown.minutes).padStart(2, "0") : "--"}m</span>
                  </div>
                )}
              </div>
            </div>

            {/* Face 2: What It Is (Calendar Details) */}
            <div
              className={`absolute inset-0 p-4 sm:p-6 bg-[#1a0c0e] flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.nextGp ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-red-400">
                  2026 Race Calendar
                </span>
                <span className="text-xs text-white/70">&rarr;</span>
              </div>

              <div className="my-auto">
                <span className="text-xs font-mono text-zinc-400 block mb-1">
                  Round {featured?.round || "19"} of 24 • Nov 6 - 8
                </span>
                <h3 className="text-lg sm:text-xl font-black italic uppercase text-white">
                  {featured?.circuit || "Autódromo José Carlos Pace"}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                  {featured?.location || "São Paulo, Brazil"} • 71 Laps • 4.309 km track
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-red-400">
                <span className="font-bold uppercase tracking-wider text-[11px]">Schedule</span>
                <span>Full Timetable &rarr;</span>
              </div>
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* TILE 3: LIVE RACE CENTER                                */}
          {/* ------------------------------------------------------- */}
          <Link
            href="/live"
            onMouseEnter={() => handleTileEnter("liveCenter")}
            onMouseLeave={() => handleTileLeave("liveCenter")}
            className="metro-tile group col-span-1 md:col-span-4 relative rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-red-600/50 shadow-md overflow-hidden min-h-[155px] sm:min-h-[170px] transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            {/* Face 1: Session Status */}
            <div
              className={`absolute inset-0 p-3 sm:p-4 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.liveCenter ? "-translate-y-full" : "translate-y-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${statusBadgeColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusIndicatorDot}`} />
                  <span>{statusBadgeLabel}</span>
                </span>
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">&rarr;</span>
              </div>

              <div className="my-1">
                <h3 className="text-sm sm:text-base font-black italic uppercase text-white truncate">
                  {statusHeadline}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400 mt-0.5 truncate">
                  {statusSubtext}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-zinc-400">
                <span className="font-bold uppercase tracking-wider text-white">Live Radar</span>
                <span className="text-red-400">Open &rarr;</span>
              </div>
            </div>

            {/* Face 2: What It Is (Telemetry Heat & Weather) */}
            <div
              className={`absolute inset-0 p-3 sm:p-4 bg-[#180e10] flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.liveCenter ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-300">
                  Live Track Telemetry
                </span>
                <span className="text-xs text-white/70">&rarr;</span>
              </div>

              <div className="my-1">
                <div className="text-xl sm:text-3xl font-black italic text-white leading-none">
                  {statusData?.weather?.trackTemp != null
                    ? `${statusData.weather.trackTemp.toFixed(1)}°C`
                    : hasTelemetry
                    ? "34.2°C"
                    : "NO DATA"}
                </div>
                <p className="text-[10px] sm:text-[11px] font-mono text-zinc-300 mt-1 truncate">
                  {hasTelemetry
                    ? `Air: ${statusData?.weather?.airTemp ? `${statusData.weather.airTemp.toFixed(1)}°C` : "24.5°C"} • Live Feed`
                    : "No telemetry data received so far"}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-red-400 gap-1">
                <span className="font-bold uppercase tracking-wider text-white flex-shrink-0">Live Radar</span>
                <span className="flex-shrink-0 whitespace-nowrap">
                  <span className="hidden sm:inline">Timing Tower &rarr;</span>
                  <span className="sm:hidden">Tower &rarr;</span>
                </span>
              </div>
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* TILE 4: RECENT RACE WINNER                              */}
          {/* ------------------------------------------------------- */}
          <Link
            href="/results"
            onMouseEnter={() => handleTileEnter("winner")}
            onMouseLeave={() => handleTileLeave("winner")}
            className="metro-tile group col-span-1 md:col-span-4 relative rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-yellow-500/50 shadow-md overflow-hidden min-h-[155px] sm:min-h-[170px] transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            {/* Face 1: Winner Name & Team */}
            <div
              className={`absolute inset-0 p-3 sm:p-4 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.winner ? "-translate-y-full" : "translate-y-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-yellow-400">
                  P1 Winner
                </span>
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">&rarr;</span>
              </div>

              <div className="my-1 max-w-[70%]">
                <h3 className="text-sm sm:text-base font-black italic uppercase text-white truncate">
                  {heroStats?.latestWinner?.fullName || "Carlos Sainz"}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                  {heroStats?.latestWinner?.teamName || "Ferrari"} • {heroStats?.latestWinner?.raceName ? heroStats.latestWinner.raceName.replace("Grand Prix", "GP") : "Mexico City GP"}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-zinc-400">
                <span className="font-bold uppercase tracking-wider text-white">Results</span>
                <span className="text-yellow-400">View &rarr;</span>
              </div>

              <div
                className="absolute right-[-4%] bottom-0 w-[42%] max-w-[95px] sm:max-w-[110px] h-[90%] pointer-events-none select-none flex items-end justify-center opacity-40 sm:opacity-85 overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent 0%, black 30%, black 100%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%, black 100%)",
                }}
                aria-hidden="true"
              >
                <DriverGraphic
                  headshotUrl={winnerPhoto}
                  fullName={heroStats?.latestWinner?.fullName || "Carlos Sainz"}
                  code={heroStats?.latestWinner?.driverCode || "SAI"}
                  driverNumber={heroStats?.latestWinner?.driverNumber || 55}
                  teamName={heroStats?.latestWinner?.teamName || "Ferrari"}
                  teamColour="#E80020"
                  variant="winner-tile"
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Face 2: What It Is (Podium Results) */}
            <div
              className={`absolute inset-0 p-3 sm:p-4 bg-[#18150a] flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.winner ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-yellow-300 truncate">
                  {heroStats?.latestWinner?.raceName
                    ? `${heroStats.latestWinner.raceName.replace("Grand Prix", "GP")} Podium`
                    : "Mexico City GP Podium"}
                </span>
                <span className="text-xs text-white/70">&rarr;</span>
              </div>

              <div className="my-1 flex flex-col gap-0.5 text-xs font-mono">
                {heroStats?.lastRacePodium && heroStats.lastRacePodium.length >= 3 ? (
                  heroStats.lastRacePodium.slice(0, 3).map((podium) => {
                    const surname = podium.fullName
                      ? podium.fullName.trim().split(" ").slice(-1)[0]
                      : podium.code;
                    const pts = podium.position === 1 ? "25 PTS" : podium.position === 2 ? "18 PTS" : "15 PTS";
                    return (
                      <div
                        key={podium.position}
                        className={`flex items-center justify-between gap-1 ${
                          podium.position === 1
                            ? "text-yellow-400 font-bold"
                            : podium.position === 2
                            ? "text-zinc-200"
                            : "text-zinc-400"
                        }`}
                      >
                        <span className="truncate">
                          {podium.position}. {surname}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0 whitespace-nowrap tabular-nums">
                          {pts}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-1 text-yellow-400 font-bold">
                      <span className="truncate">1. Sainz</span>
                      <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0 whitespace-nowrap tabular-nums">25 PTS</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 text-zinc-200">
                      <span className="truncate">2. Norris</span>
                      <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0 whitespace-nowrap tabular-nums">18 PTS</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 text-zinc-400">
                      <span className="truncate">3. Leclerc</span>
                      <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0 whitespace-nowrap tabular-nums">15 PTS</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-yellow-400 gap-1">
                <span className="font-bold uppercase tracking-wider text-white flex-shrink-0">Results</span>
                <span className="flex-shrink-0 whitespace-nowrap">
                  <span className="hidden sm:inline">Full Classification &rarr;</span>
                  <span className="sm:hidden">Full &rarr;</span>
                </span>
              </div>
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* TILE 5: TITLE BATTLE DUEL                               */}
          {/* ------------------------------------------------------- */}
          <Link
            href="/standings"
            onMouseEnter={() => handleTileEnter("duel")}
            onMouseLeave={() => handleTileLeave("duel")}
            className="metro-tile group col-span-2 md:col-span-4 relative rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-cyan-500/50 shadow-md overflow-hidden min-h-[155px] sm:min-h-[170px] transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            {/* Face 1: 4 Contender Points */}
            <div
              className={`absolute inset-0 p-4 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.duel ? "-translate-y-full" : "translate-y-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                  Title Fight
                </span>
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">&rarr;</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 my-1">
                {topContenders.map((driver) => (
                  <div key={driver.driverCode} className="p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-center">
                    <span className="text-[9px] font-mono text-zinc-400 block leading-tight">P{driver.position}</span>
                    <span className="text-xs font-black italic uppercase text-white block leading-tight">{driver.driverCode}</span>
                    <span className="text-[10px] font-mono font-bold block leading-tight" style={{ color: driver.teamColour }}>
                      {driver.points}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="font-bold uppercase tracking-wider text-white">Title Battle</span>
                <span className="text-cyan-400">Compare &rarr;</span>
              </div>
            </div>

            {/* Face 2: What It Is (Championship Gap) */}
            <div
              className={`absolute inset-0 p-4 bg-[#0a161c] flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.duel ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-300">
                  Championship Gap
                </span>
                <span className="text-xs text-white/70">&rarr;</span>
              </div>

              <div className="my-1 flex flex-col gap-0.5 text-xs font-mono">
                {topContenders.slice(0, 3).map((driver, idx) => {
                  const leadPts = Number(topContenders[0]?.points || 0);
                  const curPts = Number(driver.points || 0);
                  const surname = driver.fullName ? driver.fullName.split(" ").slice(-1)[0] : driver.driverCode;
                  const gapString =
                    idx === 0
                      ? `${driver.points} PTS (Leader)`
                      : `-${Math.max(0, leadPts - curPts)} PTS`;

                  return (
                    <div
                      key={driver.driverCode}
                      className={`flex items-center justify-between ${
                        idx === 0
                          ? "text-white font-bold"
                          : idx === 1
                          ? "text-zinc-200"
                          : "text-zinc-400"
                      }`}
                    >
                      <span className="truncate">
                        P{driver.position} {surname}
                      </span>
                      <span
                        className={`tabular-nums ${
                          idx === 0
                            ? "text-cyan-400 font-bold"
                            : idx === 1
                            ? "text-amber-300"
                            : "text-zinc-400"
                        }`}
                      >
                        {gapString}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                <span className="font-bold uppercase tracking-wider text-white">Title Battle</span>
                <span>Standings &rarr;</span>
              </div>
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* TILE 6: PADDOCK WIRE NEWS                               */}
          {/* ------------------------------------------------------- */}
          <Link
            href="/explore/news"
            onMouseEnter={() => handleTileEnter("news")}
            onMouseLeave={() => handleTileLeave("news")}
            className="metro-tile group col-span-2 md:col-span-6 relative rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-zinc-700 shadow-md overflow-hidden min-h-[155px] sm:min-h-[170px] transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            {/* Face 1: Headline A */}
            <div
              className={`absolute inset-0 p-4 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.news ? "-translate-y-full" : "translate-y-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                  {sourceA} • Wire
                </span>
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">&rarr;</span>
              </div>

              <div className="my-1">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-white leading-snug line-clamp-2">
                  {headlineA}
                </h4>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="font-bold uppercase tracking-wider text-white">Paddock Wire</span>
                <span className="text-red-400">Read &rarr;</span>
              </div>
            </div>

            {/* Face 2: Headline B */}
            <div
              className={`absolute inset-0 p-4 bg-[#14151a] flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.news ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                  {sourceB} • Wire
                </span>
                <span className="text-xs text-white/70">&rarr;</span>
              </div>

              <div className="my-1">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-white leading-snug line-clamp-2">
                  {headlineB}
                </h4>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="font-bold uppercase tracking-wider text-white">Paddock Wire</span>
                <span className="text-red-400">All Stories &rarr;</span>
              </div>
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* TILE 7: TEAM RADIO COMMS                                */}
          {/* ------------------------------------------------------- */}
          <Link
            href="/explore"
            onMouseEnter={() => handleTileEnter("radio")}
            onMouseLeave={() => handleTileLeave("radio")}
            aria-label="Paddock Team Radio Comms"
            className="metro-tile group col-span-1 md:col-span-3 relative rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-red-600/50 shadow-md overflow-hidden min-h-[155px] sm:min-h-[170px] transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            {/* Face 1: Soundwave & Quote */}
            <div
              className={`absolute inset-0 p-3 sm:p-4 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.radio ? "-translate-y-full" : "translate-y-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-500">
                  Audio Comms
                </span>
                <div className="flex items-end gap-0.5 h-3" aria-hidden="true">
                  <span className="w-0.5 bg-red-500 rounded-full animate-pulse h-2" />
                  <span className="w-0.5 bg-red-500 rounded-full animate-pulse h-3 delay-75" />
                  <span className="w-0.5 bg-red-500 rounded-full animate-pulse h-1.5 delay-150" />
                </div>
              </div>

              <div className="my-1">
                <p className="text-xs font-sans italic text-white leading-relaxed line-clamp-2">
                  &ldquo;P1, guys! The balance was absolute perfection today.&rdquo;
                </p>
                <p className="text-[10px] font-mono text-zinc-400 mt-1 truncate">
                  Antonelli • Mercedes
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-zinc-400">
                <span className="font-bold uppercase tracking-wider text-white">Radio</span>
                <span className="text-red-400">Listen &rarr;</span>
              </div>
            </div>

            {/* Face 2: What It Is (Audio Vault) */}
            <div
              className={`absolute inset-0 p-3 sm:p-4 bg-[#180a0c] flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.radio ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-300">
                  Pit Wall Team Radio
                </span>
                <span className="text-xs text-white/70">&rarr;</span>
              </div>

              <div className="my-1">
                <h4 className="text-xs font-bold text-white uppercase truncate">Live Cockpit Audio</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-300 mt-0.5 line-clamp-2 leading-tight">
                  Direct voice comms between driver and pit wall race engineer.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-red-400 gap-1">
                <span className="font-bold uppercase tracking-wider text-white flex-shrink-0">Radio</span>
                <span className="flex-shrink-0 whitespace-nowrap">
                  <span className="hidden sm:inline">Open Audio &rarr;</span>
                  <span className="sm:hidden">Listen &rarr;</span>
                </span>
              </div>
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* TILE 8: TECHNICAL LEXICON                               */}
          {/* ------------------------------------------------------- */}
          <Link
            href="/explore/lexicon"
            onMouseEnter={() => handleTileEnter("lexicon")}
            onMouseLeave={() => handleTileLeave("lexicon")}
            aria-label="2026 Technical and Aero Regulations Lexicon"
            className="metro-tile group col-span-1 md:col-span-3 relative rounded-2xl bg-[#121318] hover:bg-[#161820] border border-white/10 hover:border-cyan-500/50 shadow-md overflow-hidden min-h-[155px] sm:min-h-[170px] transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            {/* Face 1: Term */}
            <div
              className={`absolute inset-0 p-3 sm:p-4 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.lexicon ? "-translate-y-full" : "translate-y-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                  2026 Code
                </span>
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">&rarr;</span>
              </div>

              <div className="my-1">
                <h4 className="text-xs font-bold uppercase text-white truncate">
                  Venturi Ground Effect
                </h4>
                <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                  Shaped floor channels generate suction downforce without dirty wake.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-zinc-400">
                <span className="font-bold uppercase tracking-wider text-white">Lexicon</span>
                <span className="text-cyan-400">Read &rarr;</span>
              </div>
            </div>

            {/* Face 2: What It Is (Aero Concept) */}
            <div
              className={`absolute inset-0 p-3 sm:p-4 bg-[#0a181d] flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shutteredTiles.lexicon ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-300">
                  Aerodynamics
                </span>
                <span className="text-xs text-white/70">&rarr;</span>
              </div>

              <div className="my-1">
                <h4 className="text-xs font-bold text-white uppercase truncate">Ground Effect Suction</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-300 mt-0.5 line-clamp-2 leading-tight">
                  Underfloor airflow pulls chassis down for 300+ km/h cornering grip.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-cyan-400 gap-1">
                <span className="font-bold uppercase tracking-wider text-white flex-shrink-0">Lexicon</span>
                <span className="flex-shrink-0 whitespace-nowrap">
                  <span className="hidden sm:inline">Glossary &rarr;</span>
                  <span className="sm:hidden">Terms &rarr;</span>
                </span>
              </div>
            </div>
          </Link>

          {/* ------------------------------------------------------- */}
          {/* TILE 9: QUICK PADDOCK EXPLORATION SHORTCUT BANNER       */}
          {/* ------------------------------------------------------- */}
          <div className="metro-tile col-span-2 md:col-span-12 p-3 sm:p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏁</span>
              <span className="text-xs sm:text-sm font-bold uppercase text-white">
                Paddock Portals
              </span>
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">• Quick Access</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/standings"
                className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-zinc-900 border border-zinc-700/80 hover:border-cyan-500/80 text-zinc-300 hover:text-white transition-colors"
              >
                Standings
              </Link>
              <Link
                href="/schedule"
                className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-zinc-900 border border-zinc-700/80 hover:border-yellow-500/80 text-zinc-300 hover:text-white transition-colors"
              >
                Calendar
              </Link>
              <Link
                href="/live"
                className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-zinc-900 border border-zinc-700/80 hover:border-red-500/80 text-zinc-300 hover:text-white transition-colors"
              >
                Live Radar
              </Link>
              <Link
                href="/results"
                className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-zinc-900 border border-zinc-700/80 hover:border-emerald-500/80 text-zinc-300 hover:text-white transition-colors"
              >
                Results
              </Link>
              <Link
                href="/explore"
                className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-zinc-900 border border-zinc-700/80 hover:border-purple-500/80 text-zinc-300 hover:text-white transition-colors"
              >
                Audio Hub
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
