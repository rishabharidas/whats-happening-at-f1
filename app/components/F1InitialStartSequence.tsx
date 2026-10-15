"use client";

import { useEffect, useState } from "react";

export default function F1InitialStartSequence() {
  const [visible, setVisible] = useState(true);
  const [lightsCount, setLightsCount] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Only show once per browser session
    try {
      if (sessionStorage.getItem("f1_start_lights_seen") === "true") {
        setVisible(false);
        return;
      }
    } catch {
      // ignore
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];

    // F1 Starting Sequence: Lights 1 to 5 appear one by one
    timeouts.push(setTimeout(() => setLightsCount(1), 250));
    timeouts.push(setTimeout(() => setLightsCount(2), 550));
    timeouts.push(setTimeout(() => setLightsCount(3), 850));
    timeouts.push(setTimeout(() => setLightsCount(4), 1150));
    timeouts.push(setTimeout(() => setLightsCount(5), 1450));

    // Dramatic hold with all 5 lights on, then LIGHTS OUT!
    timeouts.push(
      setTimeout(() => {
        setLightsCount(0); // Lights out!
        try {
          sessionStorage.setItem("f1_start_lights_seen", "true");
          document.documentElement.classList.add("f1-lights-done");
        } catch {
          // ignore
        }
      }, 2050)
    );

    // Fade out immediately after lights out
    timeouts.push(
      setTimeout(() => {
        setFadingOut(true);
      }, 2250)
    );

    // Unmount after fade completes
    timeouts.push(
      setTimeout(() => {
        setVisible(false);
      }, 2550)
    );

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, []);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem("f1_start_lights_seen", "true");
      document.documentElement.classList.add("f1-lights-done");
    } catch {
      // ignore
    }
    setFadingOut(true);
    setTimeout(() => setVisible(false), 200);
  };

  if (!visible) return null;

  return (
    <div
      id="f1-start-overlay"
      onClick={handleDismiss}
      aria-label="Formula 1 Starting Lights Loading"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] cursor-pointer transition-opacity duration-300 ease-out ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Compact, minimal 5-light F1 starting pod */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-zinc-950/90 border border-zinc-800/90 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.9)]">
        {[1, 2, 3, 4, 5].map((num) => {
          const isRed = lightsCount >= num;
          return (
            <div
              key={num}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all duration-100 ${
                isRed
                  ? "bg-red-600 border-red-400 shadow-[0_0_14px_#ef4444,0_0_24px_rgba(239,68,68,0.7)] scale-110"
                  : "bg-zinc-900 border-zinc-800/80 shadow-none scale-100"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
