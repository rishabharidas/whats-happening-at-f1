import { Suspense } from "react";
import Link from "next/link";
import { getLiveStatus } from "@/utils/liveStatus";
import LiveTrackStatusClient from "@/components/section/LiveTrackStatusClient";
import { LiveTrackStatusSkeleton } from "@/components/section/Skeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Live Race Center & Track Telemetry | WH@F1",
  description:
    "Real-time Formula 1 Race Center: live session status, track temperatures, weather radar, timing tower, and upcoming Grand Prix schedule.",
};

async function LiveRaceCenterContent() {
  let initialData = null;
  try {
    initialData = await getLiveStatus();
  } catch (error) {
    console.error("Failed to load initial live status for /live page:", error);
  }

  return <LiveTrackStatusClient initialData={initialData} />;
}

export default function LivePage() {
  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-zinc-100 py-6 sm:py-10">
      {/* PAGE HEADER & BREADCRUMB */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors uppercase tracking-wider group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="text-[10px] sm:text-xs font-mono text-red-500 font-bold uppercase tracking-widest">
              Live Telemetry Stream
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-6 w-1 bg-red-600 rounded-full" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-red-500">
                OFFICIAL RACE CENTER
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
              Live Track <span className="text-red-600">Status</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-sans text-zinc-400 max-w-sm">
            Live circuit telemetry, timing tower, session schedules, and weather radar across the race weekend.
          </p>
        </div>
      </div>

      {/* STREAMED RACE CENTER */}
      <Suspense fallback={<LiveTrackStatusSkeleton />}>
        <LiveRaceCenterContent />
      </Suspense>
    </div>
  );
}

