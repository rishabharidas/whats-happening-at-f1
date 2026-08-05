import { Suspense } from "react";
import Link from "next/link";
import api from "@/utils/api";
import ResultsClient from "./ResultsClient";
import ResultsSkeleton from "./ResultsSkeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "2026 Season Results | WH@F1",
  description: "Formula 1 2026 race winners and results summary. Track GP winners and view detailed session reports.",
};

interface Driver {
  givenName: string;
  familyName: string;
  code: string;
  permanentNumber: string;
}

interface Constructor {
  name: string;
}

interface Result {
  position: string;
  number: string;
  grid: string;
  laps: string;
  Driver: Driver;
  Constructor: Constructor;
  Time?: {
    time: string;
  };
}

interface Race {
  round: string;
  raceName: string;
  date: string;
  time: string;
  Results?: Result[];
  Circuit: {
    circuitName: string;
    Location: {
      country: string;
      locality: string;
    };
  };
}

interface OpenF1Driver {
  driver_number: number;
  headshot_url: string;
}

interface EnrichedRace {
  round: string;
  raceName: string;
  circuitName: string;
  country: string;
  locality: string;
  raceDate: string;
  isPast: boolean;
  winner: {
    name: string;
    code: string;
    team: string;
    number: number;
    grid: string;
    time: string;
    laps: string;
    headshotUrl: string;
  } | null;
}

async function ResultsContent() {
  const { get } = api();
  let allRaces: Race[] = [];
  const raceWinners: Record<string, {
    name: string;
    code: string;
    team: string;
    number: number;
    grid: string;
    time: string;
    laps: string;
  }> = {};
  const driverImages: Record<number, string> = {};

  try {
    const [racesRes, resultsRes, openF1Res] = await Promise.all([
      get("current.json"),
      get("current/results/1.json"),
      fetch("https://api.openf1.org/v1/drivers?session_key=latest").catch(() => null),
    ]);

    if (racesRes.ok) {
      const data = await racesRes.json();
      allRaces = data?.MRData?.RaceTable?.Races || [];
    }

    if (resultsRes.ok) {
      const data = await resultsRes.json();
      const racesWithWinners = (data?.MRData?.RaceTable?.Races as Race[]) || [];
      racesWithWinners.forEach((r) => {
        const winner = r.Results?.[0];
        if (winner) {
          raceWinners[r.round] = {
            name: `${winner.Driver.givenName} ${winner.Driver.familyName}`,
            code: winner.Driver.code,
            team: winner.Constructor.name,
            number: parseInt(winner.number, 10),
            grid: winner.grid,
            time: winner.Time?.time || "Finished",
            laps: winner.laps,
          };
        }
      });
    }

    if (openF1Res && openF1Res.ok) {
      const openF1Data = (await openF1Res.json()) as OpenF1Driver[];
      if (Array.isArray(openF1Data)) {
        openF1Data.forEach((d) => {
          driverImages[d.driver_number] = d.headshot_url;
        });
      }
    }
  } catch (error: unknown) {
    if (typeof process !== "undefined" && process.stdout) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      process.stdout.write("Error fetching results: " + errorMsg + "\n");
    }
  }

  const enrichedRaces: EnrichedRace[] = allRaces.map((race) => {
    const winnerInfo = raceWinners[race.round] || null;
    const driverNumber = winnerInfo?.number;
    const headshotUrl = driverNumber ? (driverImages[driverNumber] || "").replace("1col", "4col") : "";

    const raceDate = new Date(`${race.date}T${race.time}`);
    const isPast = raceDate < new Date();

    return {
      round: race.round,
      raceName: race.raceName,
      circuitName: race.Circuit.circuitName,
      country: race.Circuit.Location.country,
      locality: race.Circuit.Location.locality,
      raceDate: `${race.date}T${race.time}`,
      isPast,
      winner: winnerInfo ? {
        ...winnerInfo,
        headshotUrl,
      } : null,
    };
  });

  return <ResultsClient races={enrichedRaces} />;
}

export default function ResultsPage() {
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
              Race <span className="text-red-600">Winners</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-3">
              2026 Season results • Podium finishers • Grand Prix detailed statistics
            </p>
          </div>
        </div>

        <Suspense fallback={<ResultsSkeleton />}>
          <ResultsContent />
        </Suspense>
      </div>
    </div>
  );
}
