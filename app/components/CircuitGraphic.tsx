"use client";

import React, { useState } from "react";

interface CircuitGraphicProps {
  circuitImage?: string | null;
  circuitName?: string;
  circuitLocation?: string;
  raceName?: string;
  className?: string;
  variant?: "hero" | "card" | "compact" | "banner";
  alt?: string;
}

// Normalized SVG paths in standard 200 x 115 viewBox with iconic F1 circuit silhouettes
const CIRCUIT_DATABASE: Record<string, string> = {
  // Autódromo José Carlos Pace (Interlagos) - São Paulo, Brazil
  // Features: Main straight, Senna S (T1-2), Curva do Sol (T3), Reta Oposta, Descida do Lago, Ferradura, Bico de Pato, Junção
  interlagos:
    "M 160,25 L 65,25 C 52,25 45,34 46,44 C 47,52 38,58 28,62 C 18,66 16,78 22,90 C 28,100 48,100 78,100 L 132,100 C 152,100 162,90 156,76 C 150,64 136,60 126,60 C 114,60 108,48 114,38 C 120,28 135,30 146,38 C 158,46 172,40 174,30 C 176,25 170,25 160,25 Z",

  // Autodromo Nazionale Monza - Italy
  // Features: Main straight, Prima Variante, Curva Grande, Roggia, Lesmo 1 & 2, Serraglio, Ascari, Parabolica
  monza:
    "M 45,95 L 142,95 C 150,95 152,88 148,82 C 144,76 150,72 158,72 C 172,72 178,60 172,46 C 166,35 150,36 142,36 L 115,36 C 108,36 104,30 106,24 C 108,18 100,16 90,16 L 62,16 C 46,16 38,26 38,42 L 38,76 C 38,90 36,95 45,95 Z",

  // Circuit de Monaco - Monte Carlo
  // Features: Sainte Devote, Beau Rivage, Massenet, Casino, Mirabeau, Hairpin, Portier, Tunnel, Nouvelle Chicane, Tabac, Rascasse
  monaco:
    "M 115,86 L 142,86 C 152,86 160,78 155,68 C 150,58 138,55 128,55 C 118,55 108,48 112,38 C 116,26 134,22 148,25 C 160,28 168,22 165,15 C 160,8 138,8 108,12 C 82,15 70,26 66,42 C 62,54 74,62 84,62 C 94,62 100,70 94,80 C 88,90 102,86 115,86 Z",

  // Silverstone Circuit - Great Britain
  // Features: Copse, Maggotts, Becketts, Chapel, Hangar Straight, Stowe, Vale, Club, Abbey, Village, Wellington Straight, Brooklands
  silverstone:
    "M 50,72 C 38,62 40,46 54,42 C 68,38 80,48 96,44 C 112,40 128,24 148,22 C 168,18 180,32 174,48 C 168,64 146,70 128,72 L 94,76 C 78,76 72,86 62,86 C 52,86 48,80 50,72 Z",

  // Circuit de Spa-Francorchamps - Belgium
  // Features: La Source, Eau Rouge, Raidillon, Kemmel Straight, Les Combes, Bruxelles, Pouhon, Blanchimont, Bus Stop
  spa:
    "M 40,30 C 42,22 55,20 65,28 C 76,35 96,25 126,18 C 156,10 176,18 172,36 C 168,54 145,62 148,76 C 150,88 135,95 118,92 C 102,88 95,75 80,78 C 65,82 50,88 42,75 C 34,62 48,50 42,42 C 38,36 38,32 40,30 Z",

  // Autódromo Hermanos Rodríguez - Mexico City
  // Features: Main straight, Turns 1-3 Chicane, Esses, Foro Sol Stadium section, Peralta
  mexico:
    "M 40,88 L 158,88 C 168,88 174,80 168,72 C 162,64 150,64 140,64 L 105,64 C 95,64 90,54 96,46 C 102,38 118,40 128,36 C 138,30 140,18 126,14 C 110,10 95,18 85,25 C 75,32 64,34 54,30 C 44,25 36,32 36,46 L 36,76 C 36,85 34,88 40,88 Z",

  // Suzuka International Racing Course - Japan
  // Features: S Curves, Degner, Crossover, Hairpin, Spoon, 130R, Casio Triangle
  suzuka:
    "M 60,86 C 45,76 48,56 60,46 C 72,36 86,40 100,32 C 116,22 136,18 154,26 C 170,34 174,52 162,66 C 148,80 130,74 118,62 C 105,50 95,64 82,76 C 72,86 68,88 60,86 Z",

  // Las Vegas Strip Circuit - USA
  // Features: Koval Lane, Sphere Chicane, Strip Straight, Harmon Ave
  vegas:
    "M 35,86 L 168,86 C 176,86 182,78 178,70 C 174,62 165,60 160,52 C 155,42 164,30 154,22 C 142,14 125,18 105,18 L 45,18 C 36,18 30,26 30,36 L 30,76 C 30,83 28,86 35,86 Z",

  // Universal FIA Grade 1 Grand Prix Racetrack
  default:
    "M 50,86 L 142,86 C 158,86 170,76 166,60 C 162,45 148,42 138,38 C 128,32 136,18 118,15 C 98,12 85,25 72,28 C 58,32 44,25 34,38 C 24,52 32,68 45,72 C 52,75 52,80 50,86 Z",
};

function resolveCircuitKey(name = "", location = "", race = ""): string {
  const q = `${name} ${location} ${race}`.toLowerCase();
  if (
    q.includes("interlagos") ||
    q.includes("pace") ||
    q.includes("brazil") ||
    q.includes("brazilian") ||
    q.includes("são paulo") ||
    q.includes("sao paulo")
  ) {
    return "interlagos";
  }
  if (q.includes("monza") || q.includes("italy") || q.includes("italian")) {
    return "monza";
  }
  if (q.includes("monaco") || q.includes("monte carlo")) {
    return "monaco";
  }
  if (
    q.includes("silverstone") ||
    q.includes("britain") ||
    q.includes("british") ||
    q.includes("uk")
  ) {
    return "silverstone";
  }
  if (
    q.includes("spa") ||
    q.includes("francorchamps") ||
    q.includes("belgium") ||
    q.includes("belgian")
  ) {
    return "spa";
  }
  if (q.includes("rodriguez") || q.includes("mexico") || q.includes("hermanos")) {
    return "mexico";
  }
  if (q.includes("suzuka") || q.includes("japan") || q.includes("japanese")) {
    return "suzuka";
  }
  if (q.includes("vegas") || q.includes("strip")) {
    return "vegas";
  }
  return "default";
}

export default function CircuitGraphic({
  circuitImage,
  circuitName = "Grand Prix Circuit",
  circuitLocation = "FIA Grade 1 Circuit",
  raceName = "Formula 1 Grand Prix",
  className = "",
  alt,
}: CircuitGraphicProps) {
  const [imageError, setImageError] = useState(false);

  // If a valid image URL is given and hasn't errored out, render clean official image
  if (circuitImage && !imageError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={circuitImage}
        alt={alt || circuitName || "F1 Circuit Map"}
        onError={() => setImageError(true)}
        className={`object-contain filter contrast-125 brightness-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] select-none pointer-events-none transition-transform duration-300 group-hover:scale-105 ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // Pure, Minimalist F1 Vector Silhouette Fallback
  // Matches the exact aesthetic of Formula 1 broadcast circuit graphics:
  // Clean white path, fully transparent background, zero visual clutter.
  const circuitKey = resolveCircuitKey(circuitName, circuitLocation, raceName);
  const trackPath = CIRCUIT_DATABASE[circuitKey] || CIRCUIT_DATABASE.default;

  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      aria-label={`${circuitName} Circuit Silhouette`}
    >
      <svg
        viewBox="0 0 200 115"
        className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-105"
        fill="none"
      >
        {/* Subtle white contour aura */}
        <path
          d={trackPath}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Clean F1 Crisp White Track Ribbon */}
        <path
          d={trackPath}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </svg>
    </div>
  );
}
