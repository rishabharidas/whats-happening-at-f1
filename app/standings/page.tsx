import { Suspense } from "react";
import Link from "next/link";
import api from "@/utils/api";
import StandingsClient from "@/components/section/StandingsClient";
import { StandingsSkeleton } from "@/components/section/Skeletons";
import TeamLogo from "@/components/TeamLogo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "2026 World Championship Standings | WH@F1",
  description:
    "Official Formula 1 World Championship standings for drivers and constructors. Track points, positions, and championship battles.",
};

const TEAM_COLORS: Record<string, string> = {
  "red bull": "3671C6",
  "red bull racing": "3671C6",
  "mercedes": "27F4D2",
  "ferrari": "E80020",
  "mclaren": "FF8000",
  "aston martin": "229971",
  "alpine f1 team": "0093cc",
  "alpine": "0093cc",
  "williams": "64C4FF",
  "rb f1 team": "6692FF",
  "rb": "6692FF",
  "kick sauber": "52E252",
  "sauber": "52E252",
  "haas f1 team": "B6BABD",
  "haas": "B6BABD",
  "audi": "E00000",
  "cadillac f1 team": "FFD700",
};

async function StandingsDataView() {
  const { get } = api();

  // Parallel fetch: drivers standings, constructors standings, and OpenF1 driver headshots
  const [driversRes, teamsRes, openF1Res] = await Promise.all([
    get("current/driverStandings.json").catch(() => null),
    get("current/constructorStandings.json").catch(() => null),
    fetch("https://api.openf1.org/v1/drivers?session_key=latest", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(1800),
    }).catch(() => null),
  ]);

  const [driversData, teamsData, openF1Data] = await Promise.all([
    driversRes && driversRes.ok ? driversRes.json().catch(() => null) : null,
    teamsRes && teamsRes.ok ? teamsRes.json().catch(() => null) : null,
    openF1Res && openF1Res.ok ? openF1Res.json().catch(() => null) : null,
  ]);

  const driverImages: Record<number, string> = {};
  if (Array.isArray(openF1Data)) {
    openF1Data.forEach((d: { driver_number?: number; headshot_url?: string }) => {
      if (typeof d.driver_number === "number" && d.headshot_url) {
        driverImages[d.driver_number] = d.headshot_url;
      }
    });
  }

  const standingsList =
    driversData?.MRData?.StandingsTable?.StandingsLists?.[0];
  const driversList = standingsList?.DriverStandings || [];
  const constructorsList =
    teamsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ||
    [];

  const seasonYear = standingsList?.season || "2026";
  const currentRound = standingsList?.round || "17";

  const driversStandings = driversList.map(
    (driverStanding: {
      position: string;
      points: string | number;
      Driver: { givenName: string; familyName: string; permanentNumber: string };
      Constructors?: Array<{ name: string }>;
    }) => {
      const driver = driverStanding.Driver;
      const constructor = driverStanding.Constructors?.[0];
      const teamName = constructor?.name || "";
      const driverNum = parseInt(driver.permanentNumber) || 0;

      return {
        position: parseInt(driverStanding.position),
        full_name: `${driver.givenName} ${driver.familyName}`,
        driver_number: driverNum,
        team_name: teamName,
        team_colour: TEAM_COLORS[teamName.toLowerCase()] || "333333",
        headshot_url: (driverImages[driverNum] || "").replace("1col", "4col"),
        points_current: driverStanding.points,
      };
    },
  );

  const constructorsStandings = constructorsList.map(
    (teamStanding: {
      position: string;
      points: string | number;
      Constructor: { name: string };
    }) => {
      const team = teamStanding.Constructor;
      const teamName = team?.name || "";

      return {
        position: parseInt(teamStanding.position),
        team_name: teamName,
        team_colour: TEAM_COLORS[teamName.toLowerCase()] || "333333",
        points_current: teamStanding.points,
      };
    },
  );

  const leaderDriver = driversStandings[0];
  const runnerUpDriver = driversStandings[1];
  const leaderConstructor = constructorsStandings[0];
  const pointsLead =
    leaderDriver && runnerUpDriver
      ? Number(leaderDriver.points_current) - Number(runnerUpDriver.points_current)
      : null;

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
      {/* QUICK KPI HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* WDC Leader Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 blur-2xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Drivers Championship Leader
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              P1
            </span>
          </div>
          <div className="flex items-center gap-3">
            {leaderDriver?.headshot_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={leaderDriver.headshot_url}
                alt={leaderDriver.full_name}
                className="w-12 h-12 rounded-full object-cover object-top border border-zinc-700 bg-zinc-800 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs">
                #{leaderDriver?.driver_number || "1"}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black uppercase italic text-white truncate">
                {leaderDriver?.full_name || "Leader"}
              </h3>
              <p className="text-xs font-mono text-zinc-400 truncate">
                {leaderDriver?.team_name || "Team"}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold text-base">
              {leaderDriver?.points_current || 0}{" "}
              <span className="text-xs text-zinc-400 font-normal">PTS</span>
            </span>
            {pointsLead !== null && (
              <span className="text-emerald-400 text-[11px] font-bold">
                +{pointsLead} pts over P2
              </span>
            )}
          </div>
        </div>

        {/* WCC Leader Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/10 blur-2xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Constructors Leader
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              P1 TEAM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center p-2 flex-shrink-0">
              <TeamLogo
                teamName={leaderConstructor?.team_name || "Mercedes"}
                size={28}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black uppercase italic text-white truncate">
                {leaderConstructor?.team_name || "Constructor Leader"}
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                FIA Formula 1 World Championship
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold text-base">
              {leaderConstructor?.points_current || 0}{" "}
              <span className="text-xs text-zinc-400 font-normal">PTS</span>
            </span>
            <span className="text-zinc-400 text-[11px]">
              Championship Lead
            </span>
          </div>
        </div>

        {/* Season Intelligence Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Season Progress
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
              {seasonYear}
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-mono text-zinc-400">Rounds Completed</span>
              <span className="text-sm font-mono font-bold text-white">
                Round {currentRound} of 24
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((parseInt(currentRound, 10) / 24) * 100))}%`,
                }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Remaining: {Math.max(0, 24 - parseInt(currentRound, 10))} Grands Prix</span>
            <Link
              href="/schedule"
              className="text-red-400 hover:text-white transition-colors"
            >
              Calendar &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* FULL INTERACTIVE CLIENT COMPONENT WITH SEARCH & TABS */}
      <StandingsClient
        driversStandings={driversStandings}
        constructorsStandings={constructorsStandings}
      />
    </div>
  );
}

export default function StandingsPage() {
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
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Live Official Standings
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-6 w-1 bg-red-600 rounded-full" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-red-500">
                CHAMPIONSHIP HUB
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
              World <span className="text-red-600">Standings</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-sans text-zinc-400 max-w-sm">
            Official FIA Formula 1 World Championship points classification for drivers and constructors.
          </p>
        </div>
      </div>

      {/* MAIN DATA VIEW STREAMED WITH SUSPENSE */}
      <Suspense fallback={<StandingsSkeleton />}>
        <StandingsDataView />
      </Suspense>
    </div>
  );
}
