import { checkSessionTiming } from "./sessionTiming";

export type EventPhase =
  | "LIVE_SESSION"
  | "UPCOMING_SESSION"
  | "SESSION_COMPLETED"
  | "BETWEEN_SESSIONS"
  | "OUTSIDE_EVENT_WINDOW"
  | "UNAVAILABLE_OR_STALE"
  | "UNKNOWN_SCHEDULE";

export interface LiveDriver {
  position: number;
  driverNumber: number;
  fullName: string;
  code: string;
  teamName: string;
  teamColour: string;
  headshotUrl: string;
  gapToLeader: string | number;
  interval: string | number;
}

export interface TrackWeather {
  airTemp: number | null;
  trackTemp: number | null;
  humidity: number | null;
  windSpeed: number | null;
  rainfall: boolean;
  timeRecorded: string | null;
}

export interface WeekendSession {
  sessionName: string;
  dateStart: string;
  status: "past" | "live" | "upcoming";
}

export interface DriverCardMeta {
  fullName: string;
  teamName: string;
  points: string;
  driverCode: string;
  driverNumber: string;
  headshotUrl: string;
  teamColour: string;
}

export interface HeroContextStats {
  season: string;
  currentRound: string;
  totalRounds: number;
  wdcLeader: DriverCardMeta | null;
  latestWinner: {
    fullName: string;
    raceName: string;
    round: string;
    driverCode: string;
    driverNumber: string;
    teamName: string;
    teamColour: string;
    headshotUrl: string;
  } | null;
  lastRacePodium: Array<{
    position: number;
    code: string;
    fullName: string;
    teamColour: string;
  }>;
  topStandings: Array<{
    position: number;
    fullName: string;
    driverCode: string;
    driverNumber: string;
    teamName: string;
    teamColour: string;
    points: string;
    headshotUrl: string;
  }>;
}

export interface LiveStatusData {
  phase: EventPhase;
  isLive: boolean;
  serverTime: string;
  isStale: boolean;
  activeSession: {
    sessionName: string;
    raceName: string;
    round: string | null;
    circuit: string;
    country: string;
    location: string;
    dateStart?: string;
  } | null;
  leaderboard: LiveDriver[];
  weather: TrackWeather | null;
  nextSession: {
    sessionName: string;
    raceName: string;
    round: string;
    circuit: string;
    country: string;
    location: string;
    dateStart: string;
  } | null;
  recentSession: {
    sessionName: string;
    raceName: string;
    round: string;
    circuit: string;
    country: string;
    dateStart: string;
  } | null;
  featuredGrandPrix: {
    round: string;
    raceName: string;
    circuit: string;
    country: string;
    location: string;
    circuitImage: string;
    countryFlag: string;
    weekendStart: string;
    raceStart: string;
    sessions: WeekendSession[];
  } | null;
  heroStats: HeroContextStats;
  openF1SessionKey: number | null;
}

interface JolpicaSessionObj {
  date?: string;
  time?: string;
}

interface JolpicaRace {
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitId?: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  FirstPractice?: JolpicaSessionObj;
  SecondPractice?: JolpicaSessionObj;
  ThirdPractice?: JolpicaSessionObj;
  SprintShootout?: JolpicaSessionObj;
  SprintQualifying?: JolpicaSessionObj;
  Sprint?: JolpicaSessionObj;
  Qualifying?: JolpicaSessionObj;
}

const TEAM_COLORS_MAP: Record<string, string> = {
  "red bull": "#3671C6",
  "red bull racing": "#3671C6",
  "mercedes": "#00D2BE",
  "mercedes amg": "#00D2BE",
  "mercedes-benz": "#00D2BE",
  "ferrari": "#E80020",
  "mclaren": "#FF8000",
  "aston martin": "#229971",
  "alpine": "#0093cc",
  "alpine f1 team": "#0093cc",
  "williams": "#64C4FF",
  "rb f1 team": "#6692FF",
  "rb": "#6692FF",
  "kick sauber": "#52E252",
  "sauber": "#52E252",
  "haas f1 team": "#B6BABD",
  "haas": "#B6BABD",
  "audi": "#E00000",
  "cadillac": "#FFD700",
  "cadillac f1 team": "#FFD700",
};

export async function getLiveStatus(): Promise<LiveStatusData> {
  const now = new Date();

  try {
    // 1. Parallel fetch for calendar, OpenF1 session & drivers, standings, and last race results
    const [openF1SessionRes, jolpicaRes, standingsRes, lastResultRes, driversRes] = await Promise.all([
      fetch("https://api.openf1.org/v1/sessions?session_key=latest", {
        next: { revalidate: 60 },
      }).catch(() => null),
      fetch("https://api.jolpi.ca/ergast/f1/current.json", {
        next: { revalidate: 60 },
      }).catch(() => null),
      fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json", {
        next: { revalidate: 120 },
      }).catch(() => null),
      fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json", {
        next: { revalidate: 120 },
      }).catch(() => null),
      fetch("https://api.openf1.org/v1/drivers?session_key=latest", {
        next: { revalidate: 180 },
      }).catch(() => null),
    ]);

    let openF1Session: Record<string, unknown> | null = null;
    if (openF1SessionRes && openF1SessionRes.ok) {
      const data = await openF1SessionRes.json();
      if (Array.isArray(data) && data.length > 0) {
        openF1Session = data[0];
      }
    }

    // Build drivers dictionary from OpenF1
    const openF1DriversMap: Record<number, Record<string, unknown>> = {};
    if (driversRes && driversRes.ok) {
      const dData = await driversRes.json();
      if (Array.isArray(dData)) {
        dData.forEach((d) => {
          if (typeof d.driver_number === "number") {
            openF1DriversMap[d.driver_number] = d;
          }
        });
      }
    }

    const getDriverPhoto = (dNum: number | string, fallbackCode?: string): string => {
      const numInt = parseInt(String(dNum), 10);
      const opDriver = openF1DriversMap[numInt];
      if (opDriver && typeof opDriver.headshot_url === "string") {
        return opDriver.headshot_url.replace("1col", "4col");
      }
      // Known high-res fallback portraits
      if (numInt === 12 || fallbackCode === "ANT") {
        return "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/ANDANT01_Kimi_Antonelli/andant01.png.transform/4col/image.png";
      }
      if (numInt === 3 || fallbackCode === "VER") {
        return "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/4col/image.png";
      }
      if (numInt === 44 || fallbackCode === "HAM") {
        return "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/4col/image.png";
      }
      if (numInt === 63 || fallbackCode === "RUS") {
        return "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/4col/image.png";
      }
      if (numInt === 1 || fallbackCode === "NOR") {
        return "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/4col/image.png";
      }
      if (numInt === 16 || fallbackCode === "LEC") {
        return "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/4col/image.png";
      }
      return "";
    };

    let allRaces: JolpicaRace[] = [];
    let season = String(now.getFullYear());
    if (jolpicaRes && jolpicaRes.ok) {
      const data = await jolpicaRes.json();
      allRaces = data?.MRData?.RaceTable?.Races || [];
      season = data?.MRData?.RaceTable?.season || season;
    }

    // Parse WDC Leader and Top 3 Standings
    let wdcLeader: HeroContextStats["wdcLeader"] = null;
    const topStandings: HeroContextStats["topStandings"] = [];

    if (standingsRes && standingsRes.ok) {
      try {
        const standingsData = await standingsRes.json();
        const standingsList =
          standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

        const topDriver = standingsList[0];
        if (topDriver) {
          const dNum = topDriver.Driver?.permanentNumber || "12";
          const teamName = topDriver.Constructors?.[0]?.name || "Mercedes";
          const dCode = topDriver.Driver?.code || "ANT";
          wdcLeader = {
            fullName: `${topDriver.Driver?.givenName || ""} ${topDriver.Driver?.familyName || ""}`.trim(),
            teamName,
            points: topDriver.points || "0",
            driverCode: dCode,
            driverNumber: dNum,
            headshotUrl: getDriverPhoto(dNum, dCode),
            teamColour: TEAM_COLORS_MAP[teamName.toLowerCase()] || "#00D2BE",
          };
        }

        // Top 3 for Championship fight tile
        standingsList.slice(0, 3).forEach((item: any, idx: number) => {
          const dNum = item.Driver?.permanentNumber || `${idx + 1}`;
          const teamName = item.Constructors?.[0]?.name || "F1 Team";
          const dCode = item.Driver?.code || "DRV";
          topStandings.push({
            position: parseInt(item.position) || idx + 1,
            fullName: `${item.Driver?.givenName || ""} ${item.Driver?.familyName || ""}`.trim(),
            driverCode: dCode,
            driverNumber: dNum,
            teamName,
            teamColour: TEAM_COLORS_MAP[teamName.toLowerCase()] || "#ef4444",
            points: item.points || "0",
            headshotUrl: getDriverPhoto(dNum, dCode),
          });
        });
      } catch {
        // silent
      }
    }

    // Parse Last Race Winner and Podium Finishers
    let latestWinner: HeroContextStats["latestWinner"] = null;
    const lastRacePodium: HeroContextStats["lastRacePodium"] = [];

    if (lastResultRes && lastResultRes.ok) {
      try {
        const lastData = await lastResultRes.json();
        const lastRace = lastData?.MRData?.RaceTable?.Races?.[0];
        const results = lastRace?.Results || [];

        if (lastRace && results[0]) {
          const winnerDriver = results[0].Driver;
          const winnerConstructor = results[0].Constructor;
          const dNum = winnerDriver?.permanentNumber || results[0].number || "3";
          const dCode = winnerDriver?.code || "VER";
          const teamName = winnerConstructor?.name || "Red Bull Racing";

          latestWinner = {
            fullName: `${winnerDriver?.givenName || ""} ${winnerDriver?.familyName || ""}`.trim(),
            raceName: lastRace.raceName,
            round: lastRace.round,
            driverCode: dCode,
            driverNumber: String(dNum),
            teamName,
            teamColour: TEAM_COLORS_MAP[teamName.toLowerCase()] || "#3671C6",
            headshotUrl: getDriverPhoto(dNum, dCode),
          };
        }

        results.slice(0, 3).forEach((res: any, idx: number) => {
          const teamName = res.Constructor?.name || "";
          lastRacePodium.push({
            position: idx + 1,
            code: res.Driver?.code || `P${idx + 1}`,
            fullName: `${res.Driver?.givenName || ""} ${res.Driver?.familyName || ""}`.trim(),
            teamColour: TEAM_COLORS_MAP[teamName.toLowerCase()] || "#ffffff",
          });
        });
      } catch {
        // silent
      }
    }

    // If allRaces is empty, return UNKNOWN_SCHEDULE
    if (allRaces.length === 0) {
      return {
        phase: "UNKNOWN_SCHEDULE",
        isLive: false,
        serverTime: now.toISOString(),
        isStale: true,
        activeSession: null,
        leaderboard: [],
        weather: null,
        nextSession: null,
        recentSession: null,
        featuredGrandPrix: null,
        heroStats: {
          season,
          currentRound: "0",
          totalRounds: 0,
          wdcLeader,
          latestWinner,
          lastRacePodium,
          topStandings,
        },
        openF1SessionKey: null,
      };
    }

    // 2. Map all individual sessions across the calendar
    interface FlatSession {
      round: string;
      raceName: string;
      circuit: string;
      country: string;
      locality: string;
      sessionName: string;
      dateStart: string;
    }

    const calendarSessions: FlatSession[] = [];
    allRaces.forEach((race) => {
      const circuit = race.Circuit.circuitName;
      const country = race.Circuit.Location.country;
      const locality = race.Circuit.Location.locality;
      const round = race.round;
      const raceName = race.raceName;

      const addSess = (name: string, obj?: JolpicaSessionObj) => {
        if (obj?.date && obj?.time) {
          calendarSessions.push({
            round,
            raceName,
            circuit,
            country,
            locality,
            sessionName: name,
            dateStart: `${obj.date}T${obj.time}`,
          });
        }
      };

      addSess("Practice 1", race.FirstPractice);
      addSess("Practice 2", race.SecondPractice);
      addSess("Practice 3", race.ThirdPractice);
      addSess("Sprint Shootout", race.SprintShootout);
      addSess("Sprint Qualifying", race.SprintQualifying);
      addSess("Sprint", race.Sprint);
      addSess("Qualifying", race.Qualifying);
      if (race.date && race.time) {
        addSess("Race", { date: race.date, time: race.time });
      }
    });

    calendarSessions.sort(
      (a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
    );

    // 3. Check for genuinely ONGOING live session
    const activeCalendarSession = calendarSessions.find((s) => {
      const timing = checkSessionTiming(s.dateStart, s.sessionName, now);
      return timing.isOngoing;
    });

    let isOpenF1Live = false;
    if (
      openF1Session &&
      typeof openF1Session.date_start === "string" &&
      typeof openF1Session.date_end === "string"
    ) {
      const f1Start = new Date(openF1Session.date_start).getTime();
      const f1End = new Date(openF1Session.date_end).getTime();
      const nowMs = now.getTime();
      if (nowMs >= f1Start && nowMs <= f1End) {
        isOpenF1Live = true;
      }
    }

    const isLive = Boolean(activeCalendarSession || isOpenF1Live);
    const sessionKey =
      typeof openF1Session?.session_key === "number" ? openF1Session.session_key : null;

    let leaderboard: LiveDriver[] = [];
    let weather: TrackWeather | null = null;

    // Fetch telemetry ONLY if genuinely live on track
    if (isLive && sessionKey) {
      try {
        const [weatherRes, posRes, intRes] = await Promise.all([
          fetch(`https://api.openf1.org/v1/weather?session_key=${sessionKey}`, {
            next: { revalidate: 30 },
          }).catch(() => null),
          fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, {
            next: { revalidate: 30 },
          }).catch(() => null),
          fetch(`https://api.openf1.org/v1/intervals?session_key=${sessionKey}`, {
            next: { revalidate: 30 },
          }).catch(() => null),
        ]);

        if (weatherRes && weatherRes.ok) {
          const wData = await weatherRes.json();
          if (Array.isArray(wData) && wData.length > 0) {
            const latestW = wData[wData.length - 1];
            weather = {
              airTemp: latestW.air_temperature ?? null,
              trackTemp: latestW.track_temperature ?? null,
              humidity: latestW.humidity ?? null,
              windSpeed: latestW.wind_speed ?? null,
              rainfall: (latestW.rainfall ?? 0) > 0,
              timeRecorded: latestW.date ?? null,
            };
          }
        }

        const intervalsMap: Record<number, { gap: unknown; interval: unknown }> = {};
        if (intRes && intRes.ok) {
          const iData = await intRes.json();
          if (Array.isArray(iData)) {
            iData.forEach((i) => {
              if (typeof i.driver_number === "number") {
                intervalsMap[i.driver_number] = {
                  gap: i.gap_to_leader,
                  interval: i.interval,
                };
              }
            });
          }
        }

        if (posRes && posRes.ok) {
          const pData = await posRes.json();
          if (Array.isArray(pData)) {
            const latestPositions: Record<number, number> = {};
            pData.forEach((p) => {
              if (typeof p.driver_number === "number" && typeof p.position === "number") {
                latestPositions[p.driver_number] = p.position;
              }
            });

            const entries = Object.entries(latestPositions).map(([dNumStr, pos]) => {
              const dNum = parseInt(dNumStr, 10);
              const driver = openF1DriversMap[dNum] || {};
              const intData = intervalsMap[dNum] || { gap: null, interval: null };

              let gapStr: string | number = "-";
              if (pos === 1) {
                gapStr = "LEADER";
              } else if (intData.gap !== null && intData.gap !== undefined) {
                gapStr =
                  typeof intData.gap === "number"
                    ? `+${intData.gap.toFixed(3)}s`
                    : String(intData.gap);
              }

              let intervalStr: string | number = "-";
              if (intData.interval !== null && intData.interval !== undefined) {
                intervalStr =
                  typeof intData.interval === "number"
                    ? `+${intData.interval.toFixed(3)}s`
                    : String(intData.interval);
              }

              return {
                position: pos,
                driverNumber: dNum,
                fullName: (driver.full_name as string) || `Driver #${dNum}`,
                code: (driver.name_acronym as string) || `${dNum}`,
                teamName: (driver.team_name as string) || "Formula 1 Team",
                teamColour: driver.team_colour ? `#${driver.team_colour}` : "#e10600",
                headshotUrl: getDriverPhoto(dNum),
                gapToLeader: gapStr,
                interval: intervalStr,
              };
            });

            entries.sort((a, b) => a.position - b.position);
            leaderboard = entries.slice(0, 10);
          }
        }
      } catch (err) {
        console.error("Error fetching live OpenF1 telemetry:", err);
      }
    }

    // 4. Identify Next & Recent Sessions
    const nextSession = calendarSessions.find((s) => {
      const timing = checkSessionTiming(s.dateStart, s.sessionName, now);
      return timing.isUpcoming;
    });

    const pastSessions = calendarSessions.filter((s) => {
      const timing = checkSessionTiming(s.dateStart, s.sessionName, now);
      return timing.isPast;
    });
    const recentSession = pastSessions[pastSessions.length - 1] || null;

    // 5. Grand Prix Weekend Detection & Event-Aware Phase Calculation
    let activeRace: JolpicaRace | null = null;
    let nextRace: JolpicaRace | null = null;

    for (const race of allRaces) {
      const firstSess = race.FirstPractice?.date && race.FirstPractice?.time
        ? new Date(`${race.FirstPractice.date}T${race.FirstPractice.time}`)
        : new Date(new Date(race.date).getTime() - 2 * 24 * 3600 * 1000);

      const raceStartTime = race.time ? `${race.date}T${race.time}` : `${race.date}T14:00:00Z`;
      const raceEndTime = new Date(new Date(raceStartTime).getTime() + 3.5 * 3600 * 1000);

      const nowTime = now.getTime();
      if (nowTime >= firstSess.getTime() && nowTime <= raceEndTime.getTime()) {
        activeRace = race;
        break;
      }

      if (nowTime < firstSess.getTime() && !nextRace) {
        nextRace = race;
      }
    }

    const targetRace = activeRace || nextRace || allRaces[allRaces.length - 1];

    const targetRaceSessions: WeekendSession[] = [];
    if (targetRace) {
      const addTargetSess = (name: string, obj?: JolpicaSessionObj) => {
        if (obj?.date && obj?.time) {
          const dateStart = `${obj.date}T${obj.time}`;
          const timing = checkSessionTiming(dateStart, name, now);
          targetRaceSessions.push({
            sessionName: name,
            dateStart,
            status: timing.isOngoing ? "live" : timing.isPast ? "past" : "upcoming",
          });
        }
      };

      addTargetSess("Practice 1", targetRace.FirstPractice);
      addTargetSess("Practice 2", targetRace.SecondPractice);
      addTargetSess("Practice 3", targetRace.ThirdPractice);
      addTargetSess("Sprint Shootout", targetRace.SprintShootout);
      addTargetSess("Sprint Qualifying", targetRace.SprintQualifying);
      addTargetSess("Sprint", targetRace.Sprint);
      addTargetSess("Qualifying", targetRace.Qualifying);
      if (targetRace.date && targetRace.time) {
        addTargetSess("Race", { date: targetRace.date, time: targetRace.time });
      }

      targetRaceSessions.sort(
        (a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
      );
    }

    let phase: EventPhase = "OUTSIDE_EVENT_WINDOW";

    if (isLive) {
      phase = "LIVE_SESSION";
    } else if (activeRace) {
      if (nextSession && activeCalendarSession) {
        phase = "LIVE_SESSION";
      } else if (recentSession) {
        const recentEnd = new Date(
          new Date(recentSession.dateStart).getTime() + 2 * 3600 * 1000
        );
        const timeSinceRecent = now.getTime() - recentEnd.getTime();
        if (timeSinceRecent >= 0 && timeSinceRecent <= 2 * 3600 * 1000) {
          phase = "SESSION_COMPLETED";
        } else if (nextSession) {
          const timeUntilNext = new Date(nextSession.dateStart).getTime() - now.getTime();
          if (timeUntilNext > 0 && timeUntilNext <= 3 * 3600 * 1000) {
            phase = "UPCOMING_SESSION";
          } else {
            phase = "BETWEEN_SESSIONS";
          }
        } else {
          phase = "BETWEEN_SESSIONS";
        }
      } else {
        phase = "BETWEEN_SESSIONS";
      }
    } else if (nextSession) {
      const timeUntilNext = new Date(nextSession.dateStart).getTime() - now.getTime();
      if (timeUntilNext > 0 && timeUntilNext <= 3 * 3600 * 1000) {
        phase = "UPCOMING_SESSION";
      } else {
        phase = "OUTSIDE_EVENT_WINDOW";
      }
    } else {
      phase = "OUTSIDE_EVENT_WINDOW";
    }

    let circuitImage = "";
    let countryFlag = "";
    if (targetRace) {
      try {
        const meetingsRes = await fetch(
          `https://api.openf1.org/v1/meetings?circuit_short_name=${encodeURIComponent(
            targetRace.Circuit.Location.locality
          )}`,
          { next: { revalidate: 3600 } }
        ).catch(() => null);

        if (meetingsRes && meetingsRes.ok) {
          const mData = await meetingsRes.json();
          if (Array.isArray(mData) && mData.length > 0) {
            circuitImage = mData[0].circuit_image || "";
            countryFlag = mData[0].country_flag || "";
          }
        }
      } catch {
        // silent
      }
    }

    const featuredGrandPrix = targetRace
      ? {
          round: targetRace.round,
          raceName: targetRace.raceName,
          circuit: targetRace.Circuit.circuitName,
          country: targetRace.Circuit.Location.country,
          location: targetRace.Circuit.Location.locality,
          circuitImage,
          countryFlag,
          weekendStart: targetRaceSessions[0]?.dateStart || `${targetRace.date}T00:00:00Z`,
          raceStart: targetRace.time
            ? `${targetRace.date}T${targetRace.time}`
            : `${targetRace.date}T14:00:00Z`,
          sessions: targetRaceSessions,
        }
      : null;

    const currentRound = targetRace?.round || "1";

    return {
      phase,
      isLive,
      serverTime: now.toISOString(),
      isStale: false,
      activeSession: isLive
        ? {
            sessionName:
              activeCalendarSession?.sessionName ||
              (openF1Session?.session_name as string) ||
              "Live Session",
            raceName:
              activeCalendarSession?.raceName ||
              `${(openF1Session?.country_name as string) || ""} Grand Prix`,
            round: activeCalendarSession?.round || null,
            circuit:
              activeCalendarSession?.circuit ||
              (openF1Session?.circuit_short_name as string) ||
              "Formula 1 Circuit",
            country:
              activeCalendarSession?.country || (openF1Session?.country_name as string) || "",
            location:
              activeCalendarSession?.locality || (openF1Session?.location as string) || "",
            dateStart:
              activeCalendarSession?.dateStart || (openF1Session?.date_start as string),
          }
        : null,
      leaderboard,
      weather,
      nextSession: nextSession
        ? {
            sessionName: nextSession.sessionName,
            raceName: nextSession.raceName,
            round: nextSession.round,
            circuit: nextSession.circuit,
            country: nextSession.country,
            location: nextSession.locality,
            dateStart: nextSession.dateStart,
          }
        : null,
      recentSession: recentSession
        ? {
            sessionName: recentSession.sessionName,
            raceName: recentSession.raceName,
            round: recentSession.round,
            circuit: recentSession.circuit,
            country: recentSession.country,
            dateStart: recentSession.dateStart,
          }
        : null,
      featuredGrandPrix,
      heroStats: {
        season,
        currentRound,
        totalRounds: allRaces.length,
        wdcLeader,
        latestWinner,
        lastRacePodium,
        topStandings,
      },
      openF1SessionKey: sessionKey,
    };
  } catch (error) {
    console.error("Critical error in getLiveStatus:", error);
    return {
      phase: "UNAVAILABLE_OR_STALE",
      isLive: false,
      serverTime: now.toISOString(),
      isStale: true,
      activeSession: null,
      leaderboard: [],
      weather: null,
      nextSession: null,
      recentSession: null,
      featuredGrandPrix: null,
      heroStats: {
        season: String(now.getFullYear()),
        currentRound: "0",
        totalRounds: 24,
        wdcLeader: null,
        latestWinner: null,
        lastRacePodium: [],
        topStandings: [],
      },
      openF1SessionKey: null,
    };
  }
}
