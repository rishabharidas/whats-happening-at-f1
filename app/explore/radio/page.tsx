import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import TeamRadioClient from "@/components/radio/TeamRadioClient";
import { fetchTeamRadioData } from "@/utils/teamRadioData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team Radio & Pit Comms | WH@F1",
  description:
    "Listen to authentic pit-wall communications, dramatic team orders, and checkered-flag celebrations from the Formula 1 paddock.",
};

export default async function RadioPage() {
  const transmissions = await fetchTeamRadioData();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans w-full py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* NAV BREADCRUMB */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4 text-xs font-mono font-bold tracking-wider uppercase">
            <Link
              href="/"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-zinc-700">/</span>
            <Link
              href="/explore"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Explore
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-red-500">Team Radio</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>FREQUENCY MONITOR ACTIVE</span>
          </div>
        </div>

        {/* HERO TITLE & EXPLAINER */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest bg-red-950 text-red-400 border border-red-800/60">
              Pit Wall Audio Console
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter">
            TEAM RADIO & <span className="text-red-600">PIT COMMS</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Listen to authentic driver-to-engineer radio transmissions. From high-drama team
            orders to euphoric victory celebrations and tense strategy calls across the Grand Prix grid.
          </p>
        </div>

        {/* INTERACTIVE TEAM RADIO CLIENT */}
        <TeamRadioClient initialTransmissions={transmissions} />
      </div>
    </div>
  );
}

