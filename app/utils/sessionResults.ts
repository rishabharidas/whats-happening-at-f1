import api from "@/utils/api";

export interface PracticeResultRow {
  position: number;
  driverNumber: number;
  driverName: string;
  driverCode: string;
  teamName: string;
  teamColor: string;
  headshotUrl: string;
  bestLapTime: string;
  bestLapDuration: number | null;
  gap: string;
  laps: number;
  status: string;
}

export interface QualifyingResultRow {
  position: number;
  driverNumber: string;
  driverName: string;
  driverCode: string;
  teamName: string;
  teamColor: string;
  headshotUrl: string;
  q1: string;
  q2: string;
  q3: string;
  gap: string;
}

export interface SessionTabInfo {
  id: string;
  name: string;
  shortCode: string;
  dateStr: string;
  isCompleted: boolean;
  type: "practice" | "qualifying" | "sprint" | "race";
  practiceResults?: PracticeResultRow[];
  qualifyingResults?: QualifyingResultRow[];
  sprintResults?: any[];
  raceResults?: any[];
  openF1SessionKey?: number;
}

export const TEAM_COLORS: Record<string, string> = {
  "red bull": "3671C6",
  "red bull racing": "3671C6",
  "mercedes": "27F4D2",
  "ferrari": "E80020",
  "mclaren": "FF8000",
  "aston martin": "229971",
  "alpine": "0093cc",
  "alpine f1 team": "0093cc",
  "williams": "64C4FF",
  "racing bulls": "6692FF",
  "rb": "6692FF",
  "rb f1 team": "6692FF",
  "kick sauber": "52E252",
  "sauber": "52E252",
  "haas": "B6BABD",
  "haas f1 team": "B6BABD",
  "audi": "E00000",
  "cadillac": "FFD700",
  "cadillac f1 team": "FFD700",
};

export function getTeamColor(teamName: string, fallbackColor?: string): string {
  if (fallbackColor && fallbackColor.length === 6) {
    return `#${fallbackColor}`;
  }
  const normalized = (teamName || "").toLowerCase().trim();
  const color = TEAM_COLORS[normalized] || "E80020";
  return `#${color}`;
}

export function formatDuration(duration: number | undefined | null): string {
  if (duration === undefined || duration === null || isNaN(duration) || duration <= 0) {
    return "—";
  }
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  if (mins > 0) {
    const secStr = secs < 10 ? `0${secs.toFixed(3)}` : secs.toFixed(3);
    return `${mins}:${secStr}`;
  }
  return `${secs.toFixed(3)}s`;
}

export function formatGap(gap: number | undefined | null, pos: number): string {
  if (pos === 1) return "Leader";
  if (gap === undefined || gap === null || isNaN(gap)) return "—";
  if (gap === 0) return "—";
  return `+${gap.toFixed(3)}s`;
}

function normalizeSessionSlug(name: string): { id: string; shortCode: string; type: "practice" | "qualifying" | "sprint" | "race" } {
  const lower = name.toLowerCase().trim();
  if (lower.includes("practice 1") || lower === "fp1") {
    return { id: "practice-1", shortCode: "FP1", type: "practice" };
  }
  if (lower.includes("practice 2") || lower === "fp2") {
    return { id: "practice-2", shortCode: "FP2", type: "practice" };
  }
  if (lower.includes("practice 3") || lower === "fp3") {
    return { id: "practice-3", shortCode: "FP3", type: "practice" };
  }
  if (lower.includes("sprint qualifying") || lower.includes("sprint shootout") || lower === "sq") {
    return { id: "sprint-qualifying", shortCode: "SQ", type: "practice" };
  }
  if (lower === "sprint") {
    return { id: "sprint", shortCode: "SPRINT", type: "sprint" };
  }
  if (lower.includes("qualifying") || lower === "q") {
    return { id: "qualifying", shortCode: "QUALI", type: "qualifying" };
  }
  return { id: "race", shortCode: "RACE", type: "race" };
}

export async function getWeekendSessions(round: string) {
  const { get } = api();
  let raceData: any = null;
  let allRaces: any[] = [];

  // 1. Fetch race schedule from Jolpica
  try {
    const res = await get("current.json");
    if (res.ok) {
      const data = await res.json();
      allRaces = data?.MRData?.RaceTable?.Races || [];
      raceData = allRaces.find((r: any) => String(r.round) === String(round));
    }
  } catch (err) {
    console.error("Error fetching current.json from Jolpica:", err);
  }

  const seasonYear = raceData?.season || new Date().getFullYear();
  const raceDate = raceData?.date ? new Date(`${raceData.date}T${raceData.time || "12:00:00Z"}`) : new Date();

  // 2. Fetch Jolpica results in parallel
  const [jolpicaResultsRes, jolpicaQualifyingRes, jolpicaSprintRes] = await Promise.allSettled([
    get(`current/${round}/results.json`),
    get(`current/${round}/qualifying.json`),
    get(`current/${round}/sprint.json`),
  ]);

  let jolpicaRaceResults: any[] = [];
  let jolpicaQualifyingResults: any[] = [];
  let jolpicaSprintResults: any[] = [];

  if (jolpicaResultsRes.status === "fulfilled" && jolpicaResultsRes.value.ok) {
    try {
      const d = await jolpicaResultsRes.value.json();
      jolpicaRaceResults = d?.MRData?.RaceTable?.Races?.[0]?.Results || [];
    } catch {
      /* silent */
    }
  }

  if (jolpicaQualifyingRes.status === "fulfilled" && jolpicaQualifyingRes.value.ok) {
    try {
      const d = await jolpicaQualifyingRes.value.json();
      jolpicaQualifyingResults = d?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults || [];
    } catch {
      /* silent */
    }
  }

  if (jolpicaSprintRes.status === "fulfilled" && jolpicaSprintRes.value.ok) {
    try {
      const d = await jolpicaSprintRes.value.json();
      jolpicaSprintResults = d?.MRData?.RaceTable?.Races?.[0]?.SprintResults || [];
    } catch {
      /* silent */
    }
  }

  // 3. Find matching OpenF1 meeting
  let openF1MeetingKey: number | null = null;
  let circuitImage = "";
  let openF1Sessions: any[] = [];
  const openF1DriversMap: Record<number, any> = {};

  try {
    const meetingsRes = await fetch(`https://api.openf1.org/v1/meetings?year=${seasonYear}`, {
      next: { revalidate: 3600 },
    });
    if (meetingsRes.ok) {
      const meetings = await meetingsRes.json();
      if (Array.isArray(meetings)) {
        // Exclude pre-season testing
        const gpMeetings = meetings.filter((m: any) => !m.meeting_name?.toLowerCase().includes("testing"));
        let closestMeeting: any = null;
        let minDiff = Infinity;

        for (const m of gpMeetings) {
          if (!m.date_start) continue;
          const mDate = new Date(m.date_start);
          const diffMs = Math.abs(mDate.getTime() - raceDate.getTime());
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays <= 4 && diffDays < minDiff) {
            minDiff = diffDays;
            closestMeeting = m;
          }
        }

        if (closestMeeting) {
          openF1MeetingKey = closestMeeting.meeting_key;
          circuitImage = closestMeeting.circuit_image || "";
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch OpenF1 meetings:", err);
  }

  // 4. If OpenF1 meeting found, fetch sessions and drivers for the meeting
  if (openF1MeetingKey) {
    try {
      const [sessionsRes, driversRes] = await Promise.all([
        fetch(`https://api.openf1.org/v1/sessions?meeting_key=${openF1MeetingKey}`, {
          next: { revalidate: 60 },
        }),
        fetch(`https://api.openf1.org/v1/drivers?meeting_key=${openF1MeetingKey}`, {
          next: { revalidate: 3600 },
        }),
      ]);

      if (sessionsRes.ok) {
        openF1Sessions = await sessionsRes.json();
      }

      if (driversRes.ok) {
        const driversList = await driversRes.json();
        if (Array.isArray(driversList)) {
          driversList.forEach((d: any) => {
            if (d.driver_number) {
              openF1DriversMap[d.driver_number] = d;
            }
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch OpenF1 sessions or drivers:", err);
    }
  }

  // Helper to get driver headshot & meta
  const getDriverMeta = (num: number | string, fallbackName?: string, fallbackCode?: string, fallbackTeam?: string) => {
    const numInt = parseInt(String(num), 10);
    const opDriver = openF1DriversMap[numInt];
    const headshotRaw = opDriver?.headshot_url || "";
    const headshotUrl = headshotRaw.replace("1col", "4col");
    const driverName = opDriver?.full_name || fallbackName || `Driver #${num}`;
    const driverCode = opDriver?.name_acronym || fallbackCode || "";
    const teamName = opDriver?.team_name || fallbackTeam || "";
    const teamColor = getTeamColor(teamName, opDriver?.team_colour);

    return {
      driverName,
      driverCode,
      teamName,
      teamColor,
      headshotUrl,
    };
  };

  // 5. Build list of weekend sessions
  const sessionList: Array<{
    name: string;
    dateStr: string;
    openF1Session?: any;
  }> = [];

  // Use OpenF1 sessions if available as primary schedule order
  if (openF1Sessions && openF1Sessions.length > 0) {
    const sorted = [...openF1Sessions].sort(
      (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
    );
    sorted.forEach((s) => {
      sessionList.push({
        name: s.session_name,
        dateStr: s.date_start,
        openF1Session: s,
      });
    });
  } else if (raceData) {
    // Fallback to Jolpica race schedule
    const pushJ = (name: string, obj: any) => {
      if (obj?.date && obj?.time) {
        sessionList.push({ name, dateStr: `${obj.date}T${obj.time}` });
      }
    };
    pushJ("Practice 1", raceData.FirstPractice);
    pushJ("Practice 2", raceData.SecondPractice);
    pushJ("Practice 3", raceData.ThirdPractice);
    pushJ("Sprint Shootout", raceData.SprintShootout);
    pushJ("Sprint Qualifying", raceData.SprintQualifying);
    pushJ("Sprint", raceData.Sprint);
    pushJ("Qualifying", raceData.Qualifying);
    if (raceData.date && raceData.time) {
      sessionList.push({ name: "Race", dateStr: `${raceData.date}T${raceData.time}` });
    }
  }

  // 6. Fetch results for each session
  const finalSessions: SessionTabInfo[] = [];

  for (const s of sessionList) {
    const { id, shortCode, type } = normalizeSessionSlug(s.name);
    const sessionObj: SessionTabInfo = {
      id,
      name: s.name,
      shortCode,
      dateStr: s.dateStr,
      isCompleted: false,
      type,
      openF1SessionKey: s.openF1Session?.session_key,
    };

    if (type === "race") {
      sessionObj.raceResults = jolpicaRaceResults;
      sessionObj.isCompleted = jolpicaRaceResults.length > 0;
    } else if (type === "qualifying") {
      if (jolpicaQualifyingResults.length > 0) {
        const qualiRows: QualifyingResultRow[] = jolpicaQualifyingResults.map((q: any) => {
          const num = q.number || q.Driver?.permanentNumber;
          const meta = getDriverMeta(
            num,
            `${q.Driver?.givenName} ${q.Driver?.familyName}`,
            q.Driver?.code,
            q.Constructor?.name
          );
          return {
            position: parseInt(q.position, 10),
            driverNumber: String(num),
            driverName: meta.driverName,
            driverCode: meta.driverCode,
            teamName: meta.teamName,
            teamColor: meta.teamColor,
            headshotUrl: meta.headshotUrl,
            q1: q.Q1 || "—",
            q2: q.Q2 || "—",
            q3: q.Q3 || "—",
            gap: "—",
          };
        });

        if (qualiRows.length > 0) {
          sessionObj.qualifyingResults = qualiRows;
          sessionObj.isCompleted = true;
        }
      }
    } else if (type === "sprint") {
      sessionObj.sprintResults = jolpicaSprintResults;
      sessionObj.isCompleted = jolpicaSprintResults.length > 0;
    }

    // If it's a practice session, or if qualifying/sprint results are missing from Jolpica,
    // fetch OpenF1 session_result if openF1SessionKey is present!
    if (s.openF1Session?.session_key) {
      const sKey = s.openF1Session.session_key;
      // If not completed yet or type is practice, try OpenF1 session_result
      if (!sessionObj.isCompleted || type === "practice") {
        try {
          const res = await fetch(`https://api.openf1.org/v1/session_result?session_key=${sKey}`, {
            next: { revalidate: 60 },
          });
          if (res.ok) {
            const rawData = await res.json();
            if (Array.isArray(rawData) && rawData.length > 0) {
              sessionObj.isCompleted = true;

              if (type === "practice") {
                const practiceRows: PracticeResultRow[] = rawData.map((r: any) => {
                  const meta = getDriverMeta(r.driver_number);
                  const durationVal = Array.isArray(r.duration) ? r.duration[r.duration.length - 1] : r.duration;
                  const gapVal = Array.isArray(r.gap_to_leader) ? r.gap_to_leader[r.gap_to_leader.length - 1] : r.gap_to_leader;

                  let status = "Finished";
                  if (r.dnf) status = "DNF";
                  else if (r.dns) status = "DNS";
                  else if (r.dsq) status = "DSQ";

                  return {
                    position: r.position,
                    driverNumber: r.driver_number,
                    driverName: meta.driverName,
                    driverCode: meta.driverCode,
                    teamName: meta.teamName,
                    teamColor: meta.teamColor,
                    headshotUrl: meta.headshotUrl,
                    bestLapDuration: typeof durationVal === "number" ? durationVal : null,
                    bestLapTime: formatDuration(durationVal),
                    gap: formatGap(gapVal, r.position),
                    laps: r.number_of_laps || 0,
                    status,
                  };
                });

                // Sort by position
                practiceRows.sort((a, b) => a.position - b.position);
                sessionObj.practiceResults = practiceRows;
              } else if (type === "qualifying" && !sessionObj.qualifyingResults) {
                // Fallback qualifying from OpenF1
                const qRows: QualifyingResultRow[] = rawData.map((r: any) => {
                  const meta = getDriverMeta(r.driver_number);
                  const durations: number[] = Array.isArray(r.duration) ? r.duration : [r.duration];
                  return {
                    position: r.position,
                    driverNumber: String(r.driver_number),
                    driverName: meta.driverName,
                    driverCode: meta.driverCode,
                    teamName: meta.teamName,
                    teamColor: meta.teamColor,
                    headshotUrl: meta.headshotUrl,
                    q1: formatDuration(durations[0]),
                    q2: formatDuration(durations[1]),
                    q3: formatDuration(durations[2]),
                    gap: "—",
                  };
                });
                qRows.sort((a, b) => a.position - b.position);
                sessionObj.qualifyingResults = qRows;
              }
            }
          }
        } catch (e) {
          console.error(`Failed to fetch OpenF1 session_result for session ${sKey}:`, e);
        }
      }
    }

    finalSessions.push(sessionObj);
  }

  // Also collect all drivers for headshots
  const driverImages: Record<string, string> = {};
  Object.keys(openF1DriversMap).forEach((num) => {
    const raw = openF1DriversMap[Number(num)]?.headshot_url || "";
    if (raw) {
      driverImages[num] = raw.replace("1col", "4col");
    }
  });

  return {
    raceData,
    circuitImage,
    sessions: finalSessions,
    driverImages,
    openF1DriversMap,
  };
}
