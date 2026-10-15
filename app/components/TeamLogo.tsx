import React from "react";

interface TeamLogoProps {
  teamName: string;
  className?: string;
  size?: number;
  variant?: "color" | "white";
  alt?: string;
}

// Map various team name inputs to official team assets
export function getTeamSlug(teamName: string): string | null {
  const norm = (teamName || "").toLowerCase().trim();

  if (norm.includes("ferrari")) return "ferrari";
  if (norm.includes("red bull") || norm.includes("redbull") || norm.includes("oracle")) return "redbull";
  if (norm.includes("mercedes")) return "mercedes";
  if (norm.includes("mclaren")) return "mclaren";
  if (norm.includes("aston") || norm.includes("martin")) return "astonmartin";
  if (norm.includes("alpine")) return "alpine";
  if (norm.includes("williams")) return "williams";
  if (
    norm.includes("racing bulls") ||
    norm.includes("rb") ||
    norm.includes("vcarb") ||
    norm.includes("alphatauri") ||
    norm.includes("toro rosso") ||
    norm === "rb f1 team"
  ) {
    return "racingbulls";
  }
  if (norm.includes("haas")) return "haas";
  if (
    norm.includes("sauber") ||
    norm.includes("kick") ||
    norm.includes("stake") ||
    norm.includes("alfa romeo")
  ) {
    return "sauber";
  }
  if (norm.includes("audi")) return "audi";

  return null;
}

export default function TeamLogo({
  teamName,
  className = "w-5 h-5",
  size = 20,
  variant = "color",
  alt,
}: TeamLogoProps) {
  const slug = getTeamSlug(teamName);

  if (!slug) {
    // Elegant fallback F1 badge
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ width: size, height: size }}
        aria-label={alt || teamName || "F1 Team"}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.4" />
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeOpacity="0.6" />
      </svg>
    );
  }

  // On dark motorsport backgrounds, teams whose primary logo is black (Mercedes and Audi)
  // become invisible. We automatically use their official high-contrast white vector variant.
  const isDarkTeam = slug === "mercedes" || slug === "audi";
  const effectiveVariant = isDarkTeam ? "white" : variant;
  const filename = effectiveVariant === "white" ? `${slug}-white.webp` : `${slug}.webp`;
  const src = `/teams/${filename}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || `${teamName} official logo`}
      className={`object-contain flex-shrink-0 select-none ${
        isDarkTeam ? "filter drop-shadow-[0_0_1px_rgba(255,255,255,0.4)]" : ""
      } ${className}`}
      style={{
        width: size,
        height: size,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}
