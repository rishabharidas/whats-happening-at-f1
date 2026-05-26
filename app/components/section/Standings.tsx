import api from "@/utils/api";
import StandingsClient from "./StandingsClient";

export default async function Standings() {
  const { get } = api();

  // Fetch both drivers and constructors standings sequentially to avoid F1 API rate limits
  const driversRes = await get("/championship_drivers?session_key=latest");
  const teamsRes = await get("/championship_teams?session_key=latest");

  const driversStandingsData = await driversRes.json();
  const teamsStandingsData = await teamsRes.json();

  // Extract session key from standings data to query drivers for this session
  const session_key =
    Array.isArray(driversStandingsData) && driversStandingsData.length > 0
      ? driversStandingsData[0].session_key
      : "latest";

  const driversResponse = await get(`/drivers?session_key=${session_key}`);
  const drivers = await driversResponse.json();

  // Create a map of driver details by their driver number
  const driversMap = Array.isArray(drivers)
    ? drivers.reduce(
        (acc, driver: any) => {
          acc[driver.driver_number] = driver;
          return acc;
        },
        {} as Record<string, any>,
      )
    : {};

  // Map drivers standings with their detailed headshot and constructor info
  const driversStandings = Array.isArray(driversStandingsData)
    ? driversStandingsData.map((driver: any) => ({
        ...driver,
        ...driversMap[driver.driver_number],
      }))
    : [];

  // Map constructor colors dynamically based on drivers team mapping
  const teamColoursMap = Array.isArray(drivers)
    ? drivers.reduce(
        (acc, driver: any) => {
          if (driver.team_name && driver.team_colour) {
            acc[driver.team_name.toLowerCase()] = driver.team_colour;
          }
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  const constructorsStandings = Array.isArray(teamsStandingsData)
    ? teamsStandingsData.map((team: any) => ({
        ...team,
        team_colour: teamColoursMap[team.team_name.toLowerCase()] || "333",
      }))
    : [];

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
