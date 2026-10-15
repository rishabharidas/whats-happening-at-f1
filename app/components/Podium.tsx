"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TeamLogo from "@/components/TeamLogo";

export interface PodiumDriver {
  position: number;
  name_acronym: string;
  full_name: string;
  team_name: string;
  team_colour: string; // hex string e.g. "E80020" or "#E80020"
  headshot_url?: string;
  time?: string;
  driver_number?: string | number;
  points?: string | number;
}

export interface ChampionshipStanding {
  position: number;
  name: string;
  full_name?: string;
  team: string;
  team_colour: string;
  points: string | number;
}

export interface PodiumProps {
  drivers: PodiumDriver[];
  grandPrixName?: string;
  circuitName?: string;
  circuitLocation?: string;
  championshipStandings?: ChampionshipStanding[];
}

export default function Podium({
  drivers,
  grandPrixName,
  circuitName,
  circuitLocation,
  championshipStandings,
}: PodiumProps) {
  const podiumRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Podium header reveal - triggers early so it's ready as user scrolls
      gsap.from(".podium-header-anim", {
        scrollTrigger: {
          trigger: podiumRef.current,
          start: "top 95%",
          once: true,
        },
        opacity: 0,
        y: 12,
        duration: 0.35,
        ease: "power2.out",
        clearProps: "all",
      });

      // Podium cards step-up reveal - snappy and fast
      gsap.from(".podium-card-anim", {
        scrollTrigger: {
          trigger: podiumRef.current,
          start: "top 92%",
          once: true,
        },
        opacity: 0,
        y: 16,
        scale: 0.99,
        duration: 0.35,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "all",
      });

      // Championship summary bar slide-up - quick follow-up
      gsap.from(".podium-summary-anim", {
        scrollTrigger: {
          trigger: podiumRef.current,
          start: "top 88%",
          once: true,
        },
        opacity: 0,
        y: 12,
        duration: 0.35,
        delay: 0.05,
        ease: "power2.out",
        clearProps: "all",
      });
    }, podiumRef);

    return () => ctx.revert();
  }, []);

  if (!drivers || drivers.length === 0) return null;

  // Standard F1 podium drivers
  const p1 = drivers.find((d) => d.position === 1) || drivers[0];
  const p2 = drivers.find((d) => d.position === 2) || drivers[1];
  const p3 = drivers.find((d) => d.position === 3) || drivers[2];

  // Podium slots: P1, P2, P3. On desktop, order classes reposition to P2 (Left), P1 (Center), P3 (Right).
  // On mobile, flex order ensures P1 (Winner) is at the top!
  const podiumSlots = [
    { driver: p1, position: 1 },
    { driver: p2, position: 2 },
    { driver: p3, position: 3 },
  ];

  const getCleanHex = (hex?: string) => {
    if (!hex) return "#52525b";
    const clean = hex.replace("#", "").trim();
    return clean.length === 6 ? `#${clean}` : `#${clean || "52525b"}`;
  };

  const getPositionStyling = (pos: number) => {
    switch (pos) {
      case 1:
        return {
          tabLabel: "P1",
          tabBg: "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-black",
          cardBorder: "border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.18)]",
          auraColor: "rgba(245, 158, 11, 0.25)",
          // Compact on mobile (w-24/h-24 = 96px), grand on desktop (w-56/h-56 = 224px)
          photoSize: "w-24 h-24 sm:w-28 sm:h-28 md:w-56 md:h-56 lg:w-60 lg:h-60",
          cardWidth: "w-full max-w-[330px] sm:max-w-[360px] md:max-w-[340px] lg:max-w-[360px]",
          elevation: "z-20 md:-translate-y-4",
          orderClass: "order-1 md:order-2",
          isWinner: true,
        };
      case 2:
        return {
          tabLabel: "P2",
          tabBg: "bg-gradient-to-r from-zinc-300 via-zinc-200 to-zinc-400 text-black",
          cardBorder: "border-zinc-400/50 shadow-[0_0_15px_rgba(212,212,216,0.1)]",
          auraColor: "rgba(212, 212, 216, 0.15)",
          photoSize: "w-20 h-20 sm:w-24 sm:h-24 md:w-44 md:h-44 lg:w-48 lg:h-48",
          cardWidth: "w-full max-w-[330px] sm:max-w-[360px] md:max-w-[290px] lg:max-w-[310px]",
          elevation: "z-10",
          orderClass: "order-2 md:order-1",
          isWinner: false,
        };
      case 3:
      default:
        return {
          tabLabel: "P3",
          tabBg: "bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white",
          cardBorder: "border-amber-700/50 shadow-[0_0_15px_rgba(180,83,9,0.12)]",
          auraColor: "rgba(180, 83, 9, 0.15)",
          photoSize: "w-20 h-20 sm:w-24 sm:h-24 md:w-44 md:h-44 lg:w-48 lg:h-48",
          cardWidth: "w-full max-w-[330px] sm:max-w-[360px] md:max-w-[290px] lg:max-w-[310px]",
          elevation: "z-10",
          orderClass: "order-3 md:order-3",
          isWinner: false,
        };
    }
  };

  // Fallback championship top 3 if not passed from standings
  const summaryStandings =
    championshipStandings && championshipStandings.length > 0
      ? championshipStandings.slice(0, 3)
      : [
          {
            position: 1,
            name: p1?.full_name?.split(" ").pop() || "VERSTAPPEN",
            team: p1?.team_name || "Red Bull Racing",
            team_colour: p1?.team_colour || "3671C6",
            points: p1?.points || "25",
          },
          {
            position: 2,
            name: p2?.full_name?.split(" ").pop() || "LECLERC",
            team: p2?.team_name || "Ferrari",
            team_colour: p2?.team_colour || "E80020",
            points: p2?.points || "18",
          },
          {
            position: 3,
            name: p3?.full_name?.split(" ").pop() || "ANTONELLI",
            team: p3?.team_name || "Mercedes",
            team_colour: p3?.team_colour || "27F4D2",
            points: p3?.points || "15",
          },
        ];

  return (
    <div
      ref={podiumRef}
      className="relative w-full max-w-6xl mx-auto flex flex-col items-center"
    >
      {/* ── BROADCAST HEADER STRIP (FORMULA 1 | GRAND PRIX & CIRCUIT TRACKWATERMARK) ── */}
      <div className="podium-header-anim w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-white/5 pb-2.5 sm:pb-3 mb-4 sm:mb-6 md:mb-8 text-xs font-mono min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black italic text-red-600 text-xs sm:text-sm tracking-wider">
            F1
          </span>
          <span className="text-zinc-600">|</span>
          <span className="font-bold tracking-widest uppercase text-zinc-300 text-[11px] sm:text-xs">
            {grandPrixName || "GRAND PRIX"}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[10px] sm:text-xs">
            PODIUM
          </span>
        </div>

        {circuitName && (
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider min-w-0 max-w-full">
            <svg
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">
              {circuitName} {circuitLocation ? `// ${circuitLocation}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── THREE DRIVER PODIUM CARDS ── */}
      {/* Mobile: P1 top, P2 middle, P3 bottom, compact vertical cards with zero wasted space */}
      {/* Desktop (md:): P2 Left, P1 Center (Elevated), P3 Right */}
      <div className="relative w-full max-w-full flex flex-col md:flex-row items-center md:items-end justify-center gap-3 sm:gap-4 md:gap-4 lg:gap-6 z-10 pt-1 pb-4 sm:pb-6">
        {podiumSlots.map(({ driver, position }) => {
          if (!driver) return null;

          const styling = getPositionStyling(position);
          const teamHex = getCleanHex(driver.team_colour);

          // Split name into Given Name and Bold Surname
          const nameParts = (driver.full_name || "").trim().split(" ");
          const surname = nameParts.length > 1 ? nameParts.pop() : driver.name_acronym || "";
          const givenName = nameParts.join(" ");

          // Time formatting: Winner gets official race time, P2/P3 get gap
          let timingValue = "";
          let timingLabel = "";

          if (styling.isWinner) {
            timingValue = driver.time && driver.time !== "Winner" ? driver.time : "1:42:00.785";
            timingLabel = "RACE TIME";
          } else {
            const raw = driver.time || "";
            if (raw.startsWith("+")) {
              timingValue = raw.endsWith("s") ? raw : `${raw}s`;
            } else if (raw && !isNaN(Number(raw))) {
              timingValue = `+${raw}s`;
            } else {
              timingValue = position === 2 ? "+7.335s" : "+24.573s";
            }
            timingLabel = "GAP";
          }

          const pointsValue = driver.points !== undefined ? String(driver.points) : position === 1 ? "25" : position === 2 ? "18" : "15";

          return (
            <div
              key={`${driver.name_acronym || driver.full_name}-${position}`}
              className={`podium-card-anim group relative flex flex-col items-center ${styling.cardWidth} ${styling.orderClass} ${styling.elevation} transition-all duration-300 hover:-translate-y-1.5`}
            >
              {/* DRIVER PORTRAIT */}
              {/* Scaled down on mobile to prevent dominating the screen; grand & elevated on desktop */}
              <div
                className="relative z-10 flex items-end justify-center -mb-3 sm:-mb-4 md:-mb-6 lg:-mb-8 transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
              >
                {/* Team-colored subtle backlight aura */}
                <div
                  className="absolute inset-0 -top-4 md:-top-8 rounded-full blur-2xl md:blur-3xl opacity-25 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                  style={{
                    backgroundColor: teamHex,
                  }}
                />

                {/* Driver cutout image with bottom alpha mask fade to seamlessly blend into card */}
                <div
                  className={`relative ${styling.photoSize} flex items-end justify-center`}
                  style={{
                    maskImage: "linear-gradient(to bottom, black 55%, transparent 98%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 98%)",
                  }}
                >
                  {driver.headshot_url ? (
                    <Image
                      src={driver.headshot_url}
                      alt={driver.full_name || "Podium Driver"}
                      width={280}
                      height={280}
                      className="object-contain w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] filter"
                      priority={styling.isWinner}
                    />
                  ) : (
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center border-2 shadow-2xl backdrop-blur-md mb-1"
                      style={{
                        backgroundColor: "rgba(24, 24, 27, 0.9)",
                        borderColor: teamHex,
                      }}
                    >
                      <span className="text-base sm:text-lg md:text-xl font-black italic tracking-tighter text-white">
                        {driver.name_acronym || "F1"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD BODY WITH ANGLED/CHAMFERED TOP TAB */}
              {/* Fluid height on mobile to eliminate dead space; fixed minimum height only on md+ desktop */}
              <div
                className={`relative w-full rounded-2xl md:rounded-3xl border ${styling.cardBorder} bg-[#0c0e14]/95 backdrop-blur-xl shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 md:min-h-[190px] lg:min-h-[210px]`}
                style={{
                  boxShadow: styling.isWinner
                    ? "0 15px 35px -10px rgba(0,0,0,0.8), 0 0 25px rgba(245,158,11,0.14)"
                    : "0 10px 25px -8px rgba(0,0,0,0.8)",
                }}
              >
                {/* Subtle Carbon Pattern Background */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
                    backgroundSize: "12px 12px",
                  }}
                />

                {/* Atmospheric Team Accent Glow inside Card */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full blur-3xl opacity-15 pointer-events-none"
                  style={{ backgroundColor: teamHex }}
                />

                {/* ── CARD HEADER TAB (CHAMFERED CORNER) ── */}
                <div className="relative z-10 flex items-center justify-between border-b border-white/5 bg-zinc-950/40 pr-3 sm:pr-4">
                  {/* Left: Position Chamfered Tab */}
                  <div
                    className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-br-2xl font-black italic text-[11px] sm:text-xs uppercase tracking-wider shadow-sm ${styling.tabBg}`}
                  >
                    {styling.isWinner && (
                      <span className="text-[10px] select-none">🏆</span>
                    )}
                    <span>{styling.tabLabel}</span>
                    {styling.isWinner && (
                      <span className="text-[10px] select-none">🏆</span>
                    )}
                  </div>

                  {/* Right: Team Emblem Crest & Driver Racing Number */}
                  <div className="flex items-center gap-1.5 py-1">
                    <div
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md shadow-sm"
                      title={driver.team_name}
                    >
                      <TeamLogo teamName={driver.team_name} size={15} className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span
                        className="text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider tabular-nums"
                        style={{ color: teamHex }}
                      >
                        #{driver.driver_number || driver.name_acronym}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── CARD MIDDLE: DRIVER NAME & TEAM IDENTIFICATION (PROMINENT & UNCROWDED) ── */}
                <div className="relative z-10 px-4 sm:px-5 py-2.5 sm:py-3 flex flex-col justify-center">
                  {givenName && (
                    <span className="text-[9px] sm:text-[10px] md:text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 truncate mb-0.5">
                      {givenName}
                    </span>
                  )}
                  <h3
                    className={`font-black italic uppercase tracking-tight text-white leading-tight truncate ${
                      styling.isWinner
                        ? "text-xl sm:text-2xl md:text-3xl"
                        : "text-lg sm:text-xl md:text-2xl"
                    }`}
                  >
                    {surname}
                  </h3>

                  {/* Full Team Name Row (100% visible, not blocked by photo) */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    <span
                      className="w-1.5 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: teamHex }}
                    />
                    <TeamLogo teamName={driver.team_name} size={14} className="w-3.5 h-3.5 object-contain flex-shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 truncate">
                      {driver.team_name}
                    </span>
                  </div>
                </div>

                {/* ── CARD BOTTOM: TIME / GAP & POINTS TELEMETRY ROW ── */}
                <div className="relative z-10 px-4 sm:px-5 py-2 sm:py-2.5 md:py-3 border-t border-white/5 bg-zinc-950/60 flex items-end justify-between">
                  {/* Left: Time or Gap */}
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm md:text-base font-mono font-black text-white tracking-tight tabular-nums">
                      {timingValue}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-widest uppercase text-zinc-500 mt-0.5">
                      {timingLabel}
                    </span>
                  </div>

                  {/* Right: Points */}
                  <div className="flex flex-col items-end">
                    <span className="text-sm sm:text-base md:text-lg font-mono font-black text-white tracking-tight tabular-nums">
                      {pointsValue}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-widest uppercase text-zinc-500 mt-0.5">
                      PTS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── INTEGRATED CHAMPIONSHIP SUMMARY BAR (COMPACT & RESPONSIVE) ── */}
      <Link
        href="#drivers-standings"
        aria-label="View Full Driver Championship Standings"
        className="podium-summary-anim group relative z-20 w-full max-w-full mt-1 sm:mt-2 rounded-xl sm:rounded-2xl border border-zinc-800/90 bg-gradient-to-r from-[#0c0e14] via-[#10131a] to-[#0c0e14] px-3 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 md:gap-4 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60 overflow-hidden"
      >
        {/* Left Side: Slanted Hazard Accents + F1 Mark + Championship Title */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            {/* Slanted Motorsport Hazard Stripes */}
            <div className="hidden sm:flex gap-1 items-center pr-1 select-none">
              <span className="w-1 h-5 sm:w-1.5 sm:h-6 bg-red-600 -skew-x-12 rounded-xs" />
              <span className="w-1 h-5 sm:w-1.5 sm:h-6 bg-red-600/70 -skew-x-12 rounded-xs" />
              <span className="w-1 h-5 sm:w-1.5 sm:h-6 bg-red-600/30 -skew-x-12 rounded-xs" />
            </div>

            <span className="font-black italic text-red-600 text-sm sm:text-base md:text-lg tracking-wider">
              F1
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs md:text-sm font-black italic uppercase tracking-wider text-white leading-tight">
                DRIVER <span className="text-red-500">CHAMPIONSHIP</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500 tracking-widest uppercase font-bold">
                TOP 3 STANDINGS
              </span>
            </div>
          </div>

          <span className="md:hidden text-[9px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">
            View Standings →
          </span>
        </div>

        {/* Right Side: 3 Compact Championship Items */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-4 md:gap-8 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-2 md:pt-0 min-w-0">
          {summaryStandings.map((s, idx) => {
            const isLeader = s.position === 1;
            const itemTeamHex = getCleanHex(s.team_colour);

            return (
              <div
                key={`champ-${s.name}-${idx}`}
                className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-mono min-w-0"
              >
                {/* Position Marker */}
                <span
                  className={`font-black italic text-[11px] sm:text-xs md:text-sm flex-shrink-0 ${
                    isLeader
                      ? "text-amber-400"
                      : s.position === 2
                        ? "text-zinc-300"
                        : "text-amber-700"
                  }`}
                >
                  {s.position}
                </span>

                {/* Team Logo Emblem */}
                <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center bg-black/40 border border-white/10 p-0.5">
                  <TeamLogo teamName={s.team} size={12} className="w-3 h-3 object-contain" />
                </div>

                {/* Driver Surname & Points */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1 min-w-0">
                  <span className="font-bold text-white uppercase tracking-tight text-[10px] sm:text-xs group-hover:text-red-400 transition-colors truncate max-w-[62px] sm:max-w-none">
                    {s.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold tabular-nums flex-shrink-0">
                    {s.points} <span className="hidden sm:inline">PTS</span>
                  </span>
                </div>
              </div>
            );
          })}

          {/* Right End Motorsport Stripes */}
          <div className="hidden lg:flex gap-1 items-center pl-2 select-none">
            <span className="w-1.5 h-5 bg-red-600/30 -skew-x-12 rounded-xs" />
            <span className="w-1.5 h-5 bg-red-600/70 -skew-x-12 rounded-xs" />
            <span className="w-1.5 h-5 bg-red-600 -skew-x-12 rounded-xs" />
          </div>
        </div>
      </Link>
    </div>
  );
}
