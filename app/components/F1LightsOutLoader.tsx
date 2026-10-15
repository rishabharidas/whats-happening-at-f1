import React from "react";

interface F1LightsOutLoaderProps {
  fullscreen?: boolean;
}

export default function F1LightsOutLoader({
  fullscreen = true,
}: F1LightsOutLoaderProps) {
  const containerClasses = fullscreen
    ? "fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] text-white px-4"
    : "w-full py-8 flex items-center justify-center text-white px-4";

  return (
    <div className={containerClasses} role="status" aria-label="Loading Formula 1 session">
      {/* Compact, minimal 5-light F1 starting pod */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-zinc-950/90 border border-zinc-800/90 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.9)]">
        {[1, 2, 3, 4, 5].map((lightNum) => (
          <div
            key={lightNum}
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all duration-100 animate-f1-light-${lightNum}`}
          />
        ))}
      </div>
    </div>
  );
}
