import api from "@/utils/api";
import Link from "next/link";
import Podium from "../Podium";

const TEAM_COLORS: Record<string, string> = {
  "red bull": "3671C6",
  "mercedes": "27F4D2",
  "ferrari": "E80020",
  "mclaren": "FF8000",
  "aston martin": "229971",
  "alpine f1 team": "0093cc",
  "williams": "64C4FF",
  "rb f1 team": "6692FF",
  "kick sauber": "52E252",
  "haas f1 team": "B6BABD",
  "audi": "E00000",
  "cadillac f1 team": "FFD700"
};

export default async function Results() {
  const { get } = api();

  const results_response = await get("current/last/results.json");
  const data = await results_response.json();

  const race = data?.MRData?.RaceTable?.Races?.[0];
  if (!race) {
    return null;
  }

  const sessionName = race.raceName;
  const results = race.Results || [];

  if (results.length === 0) {
    return null;
  }

  // Get podium (top 3)
  const podiumResults = results.slice(0, 3);
  
  // Fetch headshots from OpenF1 (fast static endpoint)
  let driverImages: Record<number, string> = {};
  try {
    const openF1Res = await fetch("https://api.openf1.org/v1/drivers?session_key=latest", {
      next: { revalidate: 60 },
    });
    const openF1Data = await openF1Res.json();
    if (Array.isArray(openF1Data)) {
      openF1Data.forEach((d: any) => {
        driverImages[d.driver_number] = d.headshot_url;
      });
    }
  } catch (e) {
    console.error("Failed to fetch driver images from OpenF1", e);
  }

  const resultData = podiumResults.map((result: any) => {
    const driver = result.Driver;
    const constructor = result.Constructor;
    const teamName = constructor?.name || "";
    const driverNum = parseInt(result.number, 10);

    return {
      position: parseInt(result.position, 10),
      name_acronym: driver.code,
      full_name: `${driver.givenName} ${driver.familyName}`,
      team_name: teamName,
      team_colour: TEAM_COLORS[teamName.toLowerCase()] || "333333",
      headshot_url: (driverImages[driverNum] || "").replace(
        "1col",
        "4col"
      ),
      time: result.Time?.time || (parseInt(result.position, 10) === 1 ? "Winner" : undefined),
      points: result.points,
      driver_number: result.number || driver.permanentNumber,
    };
  });

  // Fetch top 3 championship standings for the integrated podium summary bar
  let championshipStandings: any[] = [];
  try {
    const standingsRes = await get("current/driverStandings.json");
    if (standingsRes.ok) {
      const standingsData = await standingsRes.json();
      const list =
        standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
      championshipStandings = list.slice(0, 3).map((ds: any) => ({
        position: parseInt(ds.position, 10),
        name: ds.Driver.familyName,
        full_name: `${ds.Driver.givenName} ${ds.Driver.familyName}`,
        team: ds.Constructors?.[0]?.name || "",
        team_colour: TEAM_COLORS[ds.Constructors?.[0]?.name?.toLowerCase() || ""] || "333333",
        points: ds.points,
      }));
    }
  } catch (e) {
    console.error("Failed to fetch driver standings for podium summary", e);
  }

  const circuitLoc = race.Circuit?.Location
    ? `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`
    : race.Circuit?.circuitName || "";

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-2">
      {/* CLEAN SECTION HEADER */}
      <div className="flex items-end justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 bg-red-600 rounded-full" />
          <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tighter">
            Latest <span className="text-red-600">Results</span>
          </h2>
          <span className="hidden sm:inline-block text-xs font-mono text-zinc-400 uppercase tracking-wider pl-2 border-l border-zinc-800">
            {sessionName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/results"
            id="view-all-results"
            className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-black uppercase italic tracking-widest bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:border-red-600 hover:text-white transition-all rounded-full shadow-md hover:shadow-red-900/20"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>All Results</span>
            <svg
              className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <Podium
        drivers={resultData}
        grandPrixName={sessionName}
        circuitName={race.Circuit?.circuitName}
        circuitLocation={circuitLoc}
        championshipStandings={championshipStandings}
      />
    </div>
  );
}
