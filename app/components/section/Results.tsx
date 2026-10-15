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

const DRIVER_HEADSHOTS_FALLBACK: Record<string | number, string> = {
  1: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/4col/image.png",
  3: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/4col/image.png",
  4: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANDOR01_Lando_Norris/landor01.png.transform/4col/image.png",
  16: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/4col/image.png",
  81: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/4col/image.png",
  55: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/4col/image.png",
  63: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/4col/image.png",
  44: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/4col/image.png",
  12: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/ANDANT01_Kimi_Antonelli/andant01.png.transform/4col/image.png",
  VER: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/4col/image.png",
  NOR: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANDOR01_Lando_Norris/landor01.png.transform/4col/image.png",
  LEC: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/4col/image.png",
  PIA: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/4col/image.png",
  SAI: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/4col/image.png",
  RUS: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/4col/image.png",
  HAM: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/4col/image.png",
  ANT: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/ANDANT01_Kimi_Antonelli/andant01.png.transform/4col/image.png",
};

export default async function Results() {
  const { get } = api();

  // 1. Parallel fetch for race results, standings, and OpenF1 driver images (no sequential waterfall)
  const [resultsRes, standingsRes, openF1Res] = await Promise.all([
    get("current/last/results.json").catch(() => null),
    get("current/driverStandings.json").catch(() => null),
    fetch("https://api.openf1.org/v1/drivers?session_key=latest", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(1800),
    }).catch(() => null),
  ]);

  if (!resultsRes || !resultsRes.ok) {
    return null;
  }

  // 2. Parallel JSON parse
  const [data, standingsData, openF1Data] = await Promise.all([
    resultsRes.json().catch(() => null),
    standingsRes && standingsRes.ok ? standingsRes.json().catch(() => null) : null,
    openF1Res && openF1Res.ok ? openF1Res.json().catch(() => null) : null,
  ]);

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

  // Build driver images map from OpenF1
  const driverImages: Record<number, string> = {};
  if (Array.isArray(openF1Data)) {
    openF1Data.forEach((d: any) => {
      if (typeof d.driver_number === "number" && d.headshot_url) {
        driverImages[d.driver_number] = d.headshot_url;
      }
    });
  }

  const resultData = podiumResults.map((result: any) => {
    const driver = result.Driver;
    const constructor = result.Constructor;
    const teamName = constructor?.name || "";
    const driverNum = parseInt(result.number, 10);
    const driverCode = driver.code || "";

    const headshotRaw =
      driverImages[driverNum] ||
      DRIVER_HEADSHOTS_FALLBACK[driverNum] ||
      DRIVER_HEADSHOTS_FALLBACK[driverCode] ||
      "";

    return {
      position: parseInt(result.position, 10),
      name_acronym: driverCode,
      full_name: `${driver.givenName} ${driver.familyName}`,
      team_name: teamName,
      team_colour: TEAM_COLORS[teamName.toLowerCase()] || "333333",
      headshot_url: headshotRaw.replace("1col", "4col"),
      time: result.Time?.time || (parseInt(result.position, 10) === 1 ? "Winner" : undefined),
      points: result.points,
      driver_number: result.number || driver.permanentNumber,
    };
  });

  // Extract top 3 championship standings for the integrated podium summary bar
  let championshipStandings: any[] = [];
  if (standingsData) {
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
