"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UpcomingSessionClient({
  mainSession,
  secondarySessions,
}: {
  mainSession: any;
  secondarySessions: any[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatSessionDate = (dateStr: string) => {
    const d = new Date(dateStr);

    if (!mounted) {
      // Fallback for SSR to prevent hydration mismatch (using UTC loosely)
      return {
        day: d.getUTCDate(),
        month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }),
        weekday: d.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" }).toUpperCase(),
      };
    }

    // Client-side local time formatting
    return {
      day: d.getDate(),
      month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      weekday: d.toLocaleString("default", { weekday: "short" }).toUpperCase(),
    };
  };

  const mainDate = formatSessionDate(mainSession.date_start);

  return (
    <div
      id="seasons"
      className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-4 py-10"
    >
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-red-600" />
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">
            Race <span className="text-red-600">Weekend</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest hidden md:block">
            {mainSession.circuit_short_name} • {mainSession.country_name}
          </span>
          {/* View Full Schedule link */}
          <Link
            href="/schedule"
            id="view-full-schedule"
            className="group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase italic tracking-widest bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-red-600 hover:text-white transition-all rounded-full"
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Full Schedule</span>
            <svg
              className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* PRIMARY SESSION (Big Card) */}
      <div className="relative group overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-stretch transition-all hover:border-zinc-700">
        {/* Date block */}
        <div className="bg-red-600 p-8 flex flex-col items-center justify-center text-white md:w-48 border-b md:border-b-0 md:border-r border-dashed border-white/30">
          <span className="text-sm font-bold tracking-widest opacity-80">
            {mainDate.month}
          </span>
          <span className="text-6xl font-black italic leading-none my-1">
            {mainDate.day}
          </span>
          <span className="text-lg font-bold tracking-tighter">
            {mainDate.time}
          </span>
        </div>

        {/* Session info */}
        <div className="flex-1 p-8 flex flex-col justify-center relative">
          <div className="relative z-10">
            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">
              Upcoming Session
            </span>
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {mainSession.session_name}
            </h3>
            <p className="text-zinc-400 font-medium mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" />
              {mainSession.location}
            </p>
          </div>
        </div>

        {/* Circuit image with "UPNEXT" blended on top */}
        {mainSession.circuit_image && (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden border-l border-white/5 border-dashed min-h-[160px] md:min-h-0">
            {/* Actual circuit image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainSession.circuit_image}
              alt={mainSession.circuit_short_name}
              className="w-full max-w-[280px] h-auto object-contain opacity-60 drop-shadow-2xl filter contrast-125 relative z-10 p-8"
            />

            {/* "UPNEXT" text — bottom-right, visible */}
            <div
              className="absolute bottom-4 right-5 pointer-events-none z-20 select-none"
              aria-hidden="true"
            >
              <span
                className="text-3xl font-black italic uppercase leading-none"
                style={{
                  letterSpacing: "-0.04em",
                  paddingRight: "0.1em",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(239,68,68,0.35) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "none",
                  filter: "drop-shadow(0 2px 12px rgba(239,68,68,0.4))",
                }}
              >
                UPNEXT
              </span>
            </div>

            {/* Subtle red glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* SECONDARY SESSIONS (Mini Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {secondarySessions.map((session, idx) => {
          const sDate = formatSessionDate(session.date_start);
          return (
            <div
              key={idx}
              className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex items-center gap-4 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center border-r border-zinc-800 pr-4 min-w-[60px]">
                <span className="text-[10px] font-bold text-zinc-500">
                  {sDate.weekday}
                </span>
                <span className="text-xl font-black text-white italic">
                  {sDate.day}
                </span>
              </div>

              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-red-500 uppercase tracking-tight truncate">
                  {session.session_name}
                </span>
                <span className="text-sm font-medium text-zinc-300">
                  {sDate.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
