import api from "@/utils/api";
import UpcomingSessionClient from "./UpcomingSessionClient";

export default async function UpcomingSession() {
  const { get } = api();
  let allSessions: any[] = [];

  try {
    const res = await get("current.json");
    if (res.ok) {
      const data = await res.json();
      const races = data?.MRData?.RaceTable?.Races || [];

      races.forEach((race: any) => {
        const circuit = race.Circuit.circuitName;
        const country = race.Circuit.Location.country;
        const locality = race.Circuit.Location.locality;

        const pushSession = (name: string, sessionObj: any) => {
          if (sessionObj?.date && sessionObj?.time) {
            allSessions.push({
              session_name: name,
              date_start: `${sessionObj.date}T${sessionObj.time}`,
              circuit_short_name: circuit,
              country_name: country,
              location: locality,
            });
          }
        };

        // Add all sessions in chronological order approx
        pushSession("Practice 1", race.FirstPractice);
        pushSession("Practice 2", race.SecondPractice);
        pushSession("Practice 3", race.ThirdPractice);
        pushSession("Sprint Shootout", race.SprintShootout); // some years
        pushSession("Sprint Qualifying", race.SprintQualifying); // other years
        pushSession("Sprint", race.Sprint);
        pushSession("Qualifying", race.Qualifying);
        
        // Race
        if (race.date && race.time) {
          allSessions.push({
            session_name: "Race",
            date_start: `${race.date}T${race.time}`,
            circuit_short_name: circuit,
            country_name: country,
            location: locality,
          });
        }
      });
    }
  } catch (error: any) {
    if (typeof process !== "undefined" && process.stdout) {
      process.stdout.write(
        "Error fetching sessions in UpcomingSession: " +
          (error?.message || error) +
          "\n",
      );
    }
  }

  // Sort by date ascending
  allSessions.sort(
    (a, b) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );

  const today = new Date().toISOString();
  const upcomingSessions = allSessions.filter(
    (session: any) => session.date_start > today,
  );

  // The Big Feature Session
  const mainSession = upcomingSessions[0];
  // The next 3 sessions
  const secondarySessions = upcomingSessions.slice(1, 4);

  if (!mainSession) return null;

  // Attempt to fetch circuit image from OpenF1
  let circuit_image = "";
  try {
    const year = new Date().getFullYear();
    const meetingsRes = await fetch(`https://api.openf1.org/v1/meetings?year=${year}`);
    const meetingsData = await meetingsRes.json();
    if (Array.isArray(meetingsData)) {
      const matched = meetingsData.find((m: any) => 
        m.country_name === mainSession.country_name || 
        m.circuit_short_name === mainSession.circuit_short_name
      );
      if (matched) {
        circuit_image = matched.circuit_image;
      }
    }
  } catch (e) {
    console.error("Failed to fetch meetings for circuit image", e);
  }

  return (
    <UpcomingSessionClient 
      mainSession={{ ...mainSession, circuit_image }} 
      secondarySessions={secondarySessions} 
    />
  );
}
