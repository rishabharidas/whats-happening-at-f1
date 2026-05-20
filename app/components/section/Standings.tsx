import api from "@/utils/api";
import { Driver } from "@/types/drivers";
import StandingsClient from "./StandingsClient";

export default async function Standings({ drivers }: { drivers: Driver[] }) {
  const { get } = api();

  // Fetch both drivers and constructors standings concurrently
  const [driversRes, teamsRes] = await Promise.all([
    get("championship_drivers?session_key=latest"),
    get("championship_teams?session_key=latest"),
  ]);

  const [driversStandingsData, teamsStandingsData] = await Promise.all([
    driversRes.json(),
    teamsRes.json(),
  ]);

  // Create a map of driver details by their driver number
  const driversMap = drivers.reduce(
    (acc, driver) => {
      acc[driver.driver_number] = driver;
      return acc;
    },
    {} as Record<string, (typeof drivers)[0]>,
  );

  // Map drivers standings with their detailed headshot and constructor info
  const driversStandings = driversStandingsData.map(
    (driver: any) => ({
      ...driver,
      ...driversMap[driver.driver_number],
    })
  );

  // Map constructor colors dynamically based on drivers team mapping
  const teamColoursMap = drivers.reduce(
    (acc, driver) => {
      if (driver.team_name && driver.team_colour) {
        acc[driver.team_name.toLowerCase()] = driver.team_colour;
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  const constructorsStandings = teamsStandingsData.map((team: any) => ({
    ...team,
    team_colour: teamColoursMap[team.team_name.toLowerCase()] || "333",
  }));

  return (
    <>
      <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter underline underline-offset-8 mb-12 text-center md:text-left">
        Season <span className="text-red-600">Standings</span>
      </h2>
      <StandingsClient
        driversStandings={driversStandings}
        constructorsStandings={constructorsStandings}
      />
    </>
  );
}
