"use client";

import React, { useState } from "react";
import Image from "next/image";
import TeamLogo from "@/components/TeamLogo";

interface DriverGraphicProps {
  headshotUrl?: string | null;
  fullName?: string;
  code?: string;
  driverNumber?: string | number;
  teamName?: string;
  teamColour?: string;
  className?: string;
  variant?: "portrait" | "winner-tile" | "mobile-in-card" | "avatar";
  priority?: boolean;
  alt?: string;
}

// Map known drivers to standard permanent numbers and official team colors
const DRIVER_DIRECTORY: Record<
  string,
  { number: number; code: string; team: string; hex: string }
> = {
  antonelli: { number: 12, code: "ANT", team: "Mercedes", hex: "#00D2BE" },
  verstappen: { number: 1, code: "VER", team: "Red Bull", hex: "#3671C6" },
  norris: { number: 4, code: "NOR", team: "McLaren", hex: "#FF8000" },
  leclerc: { number: 16, code: "LEC", team: "Ferrari", hex: "#E80020" },
  sainz: { number: 55, code: "SAI", team: "Ferrari", hex: "#E80020" },
  hamilton: { number: 44, code: "HAM", team: "Ferrari", hex: "#E80020" },
  russell: { number: 63, code: "RUS", team: "Mercedes", hex: "#00D2BE" },
  piastri: { number: 81, code: "PIA", team: "McLaren", hex: "#FF8000" },
  alonso: { number: 14, code: "ALO", team: "Aston Martin", hex: "#229971" },
  gasly: { number: 10, code: "GAS", team: "Alpine", hex: "#FF87BC" },
  albon: { number: 23, code: "ALB", team: "Williams", hex: "#00A0DE" },
  tsunoda: { number: 22, code: "TSU", team: "Racing Bulls", hex: "#6692FF" },
  stroll: { number: 18, code: "STR", team: "Aston Martin", hex: "#229971" },
  hulkenberg: { number: 27, code: "HUL", team: "Sauber", hex: "#52E252" },
  bearman: { number: 87, code: "BEA", team: "Haas", hex: "#B6BABD" },
  lawson: { number: 30, code: "LAW", team: "Racing Bulls", hex: "#6692FF" },
  bortoleto: { number: 5, code: "BOR", team: "Sauber", hex: "#52E252" },
  colapinto: { number: 43, code: "COL", team: "Williams", hex: "#00A0DE" },
  hadjar: { number: 6, code: "HAD", team: "Racing Bulls", hex: "#6692FF" },
  doohan: { number: 7, code: "DOO", team: "Alpine", hex: "#FF87BC" },
};

function resolveDriverMeta(name = "", code = "", team = "", num?: string | number) {
  const normName = name.toLowerCase();
  for (const [key, data] of Object.entries(DRIVER_DIRECTORY)) {
    if (normName.includes(key) || (code && code.toUpperCase() === data.code)) {
      return {
        number: num || data.number,
        code: code || data.code,
        team: team || data.team,
        hex: data.hex,
      };
    }
  }

  // Fallbacks
  return {
    number: num || 12,
    code: code || (name ? name.slice(0, 3).toUpperCase() : "F1"),
    team: team || "Formula 1",
    hex: "#00D2BE",
  };
}

export default function DriverGraphic({
  headshotUrl,
  fullName = "F1 Driver",
  code = "",
  driverNumber,
  teamName = "",
  teamColour,
  className = "",
  variant = "portrait",
  priority = false,
  alt,
}: DriverGraphicProps) {
  const [imageError, setImageError] = useState(false);

  const meta = resolveDriverMeta(fullName, code, teamName, driverNumber);
  const effectiveTeamHex = teamColour
    ? teamColour.startsWith("#")
      ? teamColour
      : `#${teamColour}`
    : meta.hex;
  const effectiveCode = code || meta.code;
  const effectiveNumber = driverNumber || meta.number;
  const effectiveTeam = teamName || meta.team;

  // 1. If valid image exists and hasn't errored out, render with onError fallback
  if (headshotUrl && !imageError) {
    if (variant === "avatar") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={headshotUrl}
          alt={alt || fullName}
          onError={() => setImageError(true)}
          className={`object-contain object-bottom filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${className}`}
          loading="lazy"
          decoding="async"
        />
      );
    }

    if (variant === "mobile-in-card") {
      return (
        <div
          className={`relative w-full h-full flex items-end justify-end ${className}`}
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 35%, black 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 35%, black 100%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={headshotUrl}
            alt={alt || fullName}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain object-bottom filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] select-none pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </div>
      );
    }

    return (
      <Image
        src={headshotUrl}
        alt={alt || fullName}
        width={variant === "winner-tile" ? 180 : 280}
        height={variant === "winner-tile" ? 180 : 280}
        onError={() => setImageError(true)}
        className={`object-contain object-bottom filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] select-none pointer-events-none ${className}`}
        priority={priority}
      />
    );
  }

  // 2. High-Tech Aerodynamic Helmet & Racing Number Hologram Fallback
  if (variant === "avatar") {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-mono font-black border text-white select-none ${className}`}
        style={{
          backgroundColor: "#121318",
          borderColor: `${effectiveTeamHex}80`,
          boxShadow: `0 0 8px ${effectiveTeamHex}30`,
        }}
        title={`${fullName} (#${effectiveNumber})`}
      >
        <span className="text-[10px] italic">#{effectiveNumber}</span>
      </div>
    );
  }

  if (variant === "mobile-in-card") {
    return (
      <div
        className={`relative flex items-end justify-center select-none pointer-events-none overflow-hidden ${className}`}
        aria-hidden="true"
      >
        {/* Ambient Team Glow Flare */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-35"
          style={{ backgroundColor: effectiveTeamHex }}
        />

        {/* In-Card Racing Number & Helmet Silhouette */}
        <div className="relative z-10 flex flex-col items-center justify-end pb-1">
          {/* Subtle stylized F1 Helmet Silhouette */}
          <svg
            viewBox="0 0 100 85"
            className="w-20 h-16 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] opacity-90"
            fill="none"
          >
            {/* Aerodynamic Shell */}
            <path
              d="M 20,55 C 16,35 32,15 58,15 C 80,15 92,30 92,50 C 92,68 76,75 50,75 C 32,75 22,68 20,55 Z"
              fill="#181a20"
              stroke={effectiveTeamHex}
              strokeWidth="2"
            />
            {/* Gloss Visor */}
            <path
              d="M 52,32 L 86,34 C 88,44 82,54 70,55 L 50,53 C 45,53 45,32 52,32 Z"
              fill="#0a0c10"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Iridescent Visor Reflection */}
            <path
              d="M 56,36 L 82,38 C 84,43 80,50 72,51 L 54,49 Z"
              fill={effectiveTeamHex}
              fillOpacity="0.45"
            />
            {/* Chin Vent */}
            <line x1="68" y1="62" x2="78" y2="62" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="66" y1="66" x2="76" y2="66" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          {/* Bold Driver Number Overlay */}
          <div
            className="text-2xl font-black italic tracking-tighter leading-none mt-[-8px] text-white"
            style={{
              textShadow: `0 0 12px ${effectiveTeamHex}`,
            }}
          >
            #{effectiveNumber}
          </div>
        </div>
      </div>
    );
  }

  // Standard / Hero / Winner Tile Fallback
  return (
    <div
      className={`relative flex items-end justify-center select-none pointer-events-none overflow-hidden ${className}`}
      aria-label={`${fullName} Telemetry Silhouette`}
    >
      {/* Dynamic Team Ambient Halo */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: effectiveTeamHex }}
      />

      {/* Holographic F1 Pilot Badge */}
      <div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-2">
        {/* Subtle Team Crest Watermark */}
        <div className="absolute top-1 opacity-20 filter contrast-125">
          <TeamLogo teamName={effectiveTeam} size={40} className="w-10 h-10 object-contain" />
        </div>

        {/* Precision Aerodynamic Helmet Vector */}
        <svg
          viewBox="0 0 100 85"
          className="w-full max-w-[140px] sm:max-w-[180px] h-auto filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]"
          fill="none"
        >
          <defs>
            <linearGradient id={`visor-grad-${effectiveCode}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor={effectiveTeamHex} stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0a0c10" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Outer Carbon Shell with Team Highlight */}
          <path
            d="M 18,54 C 14,32 30,14 58,14 C 82,14 94,30 94,50 C 94,68 76,76 48,76 C 30,76 20,68 18,54 Z"
            fill="#121318"
            stroke={effectiveTeamHex}
            strokeWidth="2.5"
          />

          {/* Aerodynamic Top Vent Intake */}
          <path d="M 44,16 L 62,16 C 60,20 46,20 44,16 Z" fill={effectiveTeamHex} />

          {/* Visor Bezel */}
          <path
            d="M 50,30 L 88,32 C 90,44 84,55 70,56 L 48,54 C 44,54 44,30 50,30 Z"
            fill="#090a0f"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />

          {/* Iridescent Visor Shield */}
          <path
            d="M 54,34 L 84,36 C 86,43 82,51 72,52 L 52,50 Z"
            fill={`url(#visor-grad-${effectiveCode})`}
          />

          {/* Visor Tear-Off Post */}
          <circle cx="85" cy="38" r="1.5" fill="#FFFFFF" />

          {/* Chin Diffuser Slots */}
          <line x1="68" y1="63" x2="80" y2="63" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="66" y1="68" x2="78" y2="68" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

          {/* Hans Device Anchor Point */}
          <circle cx="28" cy="62" r="3" fill="#27272a" stroke="#FFFFFF" strokeWidth="1" />
        </svg>

        {/* Large Monospaced Racing Number & Acronym */}
        <div className="flex items-center gap-1.5 mt-[-6px] px-2 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
          <span
            className="text-xs sm:text-sm font-black italic tracking-tighter"
            style={{ color: effectiveTeamHex }}
          >
            #{effectiveNumber}
          </span>
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-white">
            {effectiveCode}
          </span>
        </div>
      </div>
    </div>
  );
}

