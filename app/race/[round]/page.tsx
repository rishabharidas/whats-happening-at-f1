import { Suspense } from "react";
import Link from "next/link";
import api from "@/utils/api";
import SessionTabs from "./SessionTabs";
import { getWeekendSessions } from "@/utils/sessionResults";

export const dynamic = "force-dynamic";

async function RaceResultsContent({
  round,
  initialSessionId,
}: {
  round: string;
  initialSessionId?: string;
}) {
  const { circuitImage, sessions, driverImages } = await getWeekendSessions(round);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
          No schedule or results available for this race round yet.
        </p>
      </div>
    );
  }

  // Qualifying positions for grid-vs-race delta
  const qualiPositions: Record<string, number> = {};
  const qualiSession = sessions.find((s) => s.type === "qualifying");
  if (qualiSession?.qualifyingResults) {
    qualiSession.qualifyingResults.forEach((q) => {
      qualiPositions[q.driverName] = q.position;
    });
  }

  return (
    <SessionTabs
      sessions={sessions}
      circuitImage={circuitImage}
      initialSessionId={initialSessionId}
      driverImages={driverImages}
      qualiPositions={qualiPositions}
    />
  );
}

export default async function RaceResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ round: string }>;
  searchParams?: Promise<{ session?: string }>;
}) {
  const { round } = await params;
  const { session } = (await searchParams) || {};

  const { get } = api();
  let raceName = `Round ${round}`;
  let circuitName = "";
  let country = "";
  let raceDate = "";

  try {
    const res = await get("current.json");
    if (res.ok) {
      const data = await res.json();
      const races = data?.MRData?.RaceTable?.Races || [];
      const race = races.find((r: any) => String(r.round) === String(round));
      if (race) {
        raceName = race.raceName;
        circuitName = race.Circuit?.circuitName || "";
        country = race.Circuit?.Location?.country || "";
        raceDate = race.date;
      }
    }
  } catch {
    /* silent */
  }

  const formattedDate = raceDate
    ? new Date(raceDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0a0a0a] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/5 blur-[180px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20">
        {/* HEADER */}
        <div className="mb-10">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors mb-6"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 12H5M12 5l-7 7 7 7"
              />
            </svg>
            Season Schedule
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-8">
            <div>
              <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest mb-2">
                Round {round} • {country}
              </p>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter leading-none">
                {raceName}
              </h1>
              {circuitName && (
                <p className="text-zinc-500 font-mono text-sm mt-2 uppercase tracking-widest">
                  {circuitName}
                </p>
              )}
            </div>
            {formattedDate && (
              <span className="text-zinc-600 font-mono text-sm uppercase tracking-widest pb-1">
                {formattedDate}
              </span>
            )}
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-12 w-full max-w-md rounded-xl bg-zinc-900/60 border border-zinc-800" />
              <div className="h-64 rounded-3xl bg-zinc-900/40 border border-zinc-800" />
              <div className="h-48 rounded-2xl bg-zinc-900/40 border border-zinc-800" />
              <div className="h-96 rounded-2xl bg-zinc-900/40 border border-zinc-800" />
            </div>
          }
        >
          <RaceResultsContent round={round} initialSessionId={session} />
        </Suspense>
      </div>
    </div>
  );
}
