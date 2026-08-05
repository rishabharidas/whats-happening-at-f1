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
    const openF1Res = await fetch("https://api.openf1.org/v1/drivers?session_key=latest");
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

    return {
      position: parseInt(result.position),
      name_acronym: driver.code,
      full_name: `${driver.givenName} ${driver.familyName}`,
      team_name: teamName,
      team_colour: TEAM_COLORS[teamName.toLowerCase()] || "333333",
      headshot_url: (driverImages[parseInt(result.number)] || "").replace(
        "1col",
        "4col"
      ),
    };
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-4 py-2">
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-red-600" />
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">
            Latest <span className="text-red-600">Results</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest hidden md:block">
            {sessionName}
          </span>
          <Link
            href="/results"
            id="view-all-results"
            className="group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase italic tracking-widest bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-red-600 hover:text-white transition-all rounded-full"
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <Podium drivers={resultData} />
    </div>
  );
}
