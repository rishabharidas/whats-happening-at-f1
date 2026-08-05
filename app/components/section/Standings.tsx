import api from "@/utils/api";
import StandingsClient from "./StandingsClient";

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

export default async function Standings() {
  const { get } = api();

  // Fetch both drivers and constructors standings sequentially
  const driversRes = await get("current/driverStandings.json");
  const teamsRes = await get("current/constructorStandings.json");

  const driversData = await driversRes.json();
  const teamsData = await teamsRes.json();

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

  const driversList =
    driversData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ||
    [];
  const constructorsList =
    teamsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ||
    [];

  const driversStandings = driversList.map((driverStanding: any) => {
    const driver = driverStanding.Driver;
    const constructor = driverStanding.Constructors?.[0];
    const teamName = constructor?.name || "";

    return {
      position: parseInt(driverStanding.position),
      full_name: `${driver.givenName} ${driver.familyName}`,
      driver_number: parseInt(driver.permanentNumber) || 0,
      team_name: teamName,
      team_colour: TEAM_COLORS[teamName.toLowerCase()] || "333333",
      headshot_url: (driverImages[parseInt(driver.permanentNumber)] || "").replace(
        "1col",
        "4col"
      ),
      points_current: driverStanding.points,
    };
  });

  const constructorsStandings = constructorsList.map((teamStanding: any) => {
    const team = teamStanding.Constructor;
    const teamName = team?.name || "";

    return {
      position: parseInt(teamStanding.position),
      team_name: teamName,
      team_colour: TEAM_COLORS[teamName.toLowerCase()] || "333333",
      points_current: teamStanding.points,
    };
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-8 w-1 bg-red-600" />
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">
          Season <span className="text-red-600">Standings</span>
        </h2>
      </div>
      <StandingsClient
        driversStandings={driversStandings}
        constructorsStandings={constructorsStandings}
      />
    </div>
  );
}
