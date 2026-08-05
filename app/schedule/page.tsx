import { Suspense } from "react";
import Link from "next/link";
import api from "@/utils/api";
import ScheduleClient from "./ScheduleClient";
import ScheduleSkeleton from "./ScheduleSkeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "2026 Season Schedule | WH@F1",
  description: "Full 2026 Formula 1 season schedule — all rounds, all sessions. Upcoming races highlighted.",
};

async function ScheduleContent() {
  const { get } = api();
  let allRaces: any[] = [];
  let circuitImages: Record<string, string> = {};
  // round => { name, code, team }
  let raceWinners: Record<string, { name: string; code: string; team: string }> = {};

  try {
    const res = await get("current.json");
    if (res.ok) {
      const data = await res.json();
      allRaces = data?.MRData?.RaceTable?.Races || [];
    }
  } catch (error: any) {
    process.stdout?.write("Error fetching schedule: " + (error?.message || error) + "\n");
  }

  // Fetch circuit images from OpenF1
  try {
    const year = new Date().getFullYear();
    const meetingsRes = await fetch(`https://api.openf1.org/v1/meetings?year=${year}`, {
      next: { revalidate: 3600 },
    });
    const meetingsData = await meetingsRes.json();
    if (Array.isArray(meetingsData)) {
      meetingsData.forEach((m: any) => {
        if (m.country_name && m.circuit_image) {
          circuitImages[m.country_name] = m.circuit_image;
        }
      });
    }
  } catch (e) {
    // silent
  }

  // Fetch all race winners for the season in one call
  try {
    const resultsRes = await get("current/results.json");
    if (resultsRes.ok) {
      const data = await resultsRes.json();
      const races = data?.MRData?.RaceTable?.Races || [];
      races.forEach((r: any) => {
        const winner = r.Results?.[0];
        if (winner) {
          raceWinners[r.round] = {
            name: `${winner.Driver.givenName} ${winner.Driver.familyName}`,
            code: winner.Driver.code,
            team: winner.Constructor.name,
          };
        }
      });
    }
  } catch (e) {
    // silent
  }

  const now = new Date();

  const enrichedRaces = allRaces.map((race: any) => {
    const sessions: Array<{ name: string; dateStr: string }> = [];

    const pushSession = (name: string, sessionObj: any) => {
      if (sessionObj?.date && sessionObj?.time) {
        sessions.push({ name, dateStr: `${sessionObj.date}T${sessionObj.time}` });
      }
    };

    pushSession("Practice 1", race.FirstPractice);
    pushSession("Practice 2", race.SecondPractice);
    pushSession("Practice 3", race.ThirdPractice);
    pushSession("Sprint Shootout", race.SprintShootout);
    pushSession("Sprint Qualifying", race.SprintQualifying);
    pushSession("Sprint", race.Sprint);
    pushSession("Qualifying", race.Qualifying);

    if (race.date && race.time) {
      sessions.push({ name: "Race", dateStr: `${race.date}T${race.time}` });
    }

    sessions.sort(
      (a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime()
    );

    const raceDate = new Date(`${race.date}T${race.time}`);
    const firstSession = sessions[0] ? new Date(sessions[0].dateStr) : null;

    let status: "past" | "active" | "upcoming" = "upcoming";
    if (raceDate < now) {
      status = "past";
    } else if (firstSession && firstSession <= now) {
      status = "active";
    }

    const circuitImage = circuitImages[race.Circuit.Location.country] || "";
    const winner = raceWinners[race.round] || null;

    return {
      round: race.round,
      raceName: race.raceName,
      circuitName: race.Circuit.circuitName,
      country: race.Circuit.Location.country,
      locality: race.Circuit.Location.locality,
      raceDate: `${race.date}T${race.time}`,
      sessions,
      status,
      circuitImage,
      winner,
    };
  });

  const highlightIndex = enrichedRaces.findIndex((r) => r.status !== "past");

  return <ScheduleClient races={enrichedRaces} highlightIndex={highlightIndex} />;
}

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/5 blur-[180px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-8 mb-12 gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors mb-4"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back
            </Link>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-[0.9]">
              Season <span className="text-red-600">Schedule</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-3">
              All rounds • All sessions • Local times
            </p>
          </div>
          <div className="flex items-center gap-6 pb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Past</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span className="text-xs text-red-400 uppercase tracking-widest font-mono">Active / Up Next</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-widest font-mono">Upcoming</span>
            </div>
          </div>
        </div>

        <Suspense fallback={<ScheduleSkeleton />}>
          <ScheduleContent />
        </Suspense>
      </div>
    </div>
  );
}
