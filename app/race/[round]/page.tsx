import { Suspense } from "react";
import Link from "next/link";
import api from "@/utils/api";

export const dynamic = "force-dynamic";

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
  "cadillac f1 team": "FFD700",
};

function statusColor(status: string) {
  if (status === "Finished" || status.startsWith("+")) return "text-emerald-400";
  if (
    status.toLowerCase().includes("accident") ||
    status.toLowerCase().includes("collision")
  )
    return "text-orange-400";
  if (status === "Disqualified") return "text-red-500";
  return "text-zinc-500";
}

function statusLabel(status: string) {
  if (status.startsWith("+")) return status;
  const map: Record<string, string> = {
    Finished: "Finished",
    "Lap 1 Accident": "Accident L1",
    Accident: "Accident",
    Collision: "Collision",
    "Collision damage": "Collision Dmg",
    Engine: "Engine",
    Gearbox: "Gearbox",
    Hydraulics: "Hydraulics",
    Brakes: "Brakes",
    Electrical: "Electrical",
    "Power Unit": "Power Unit",
    Retired: "Retired",
  };
  return map[status] || status;
}

async function RaceResultsContent({ round }: { round: string }) {
  const { get } = api();

  const [resultsRes, qualifyingRes] = await Promise.allSettled([
    get(`current/${round}/results.json`),
    get(`current/${round}/qualifying.json`),
  ]);

  let race: any = null;
  let results: any[] = [];
  let qualifyingResults: any[] = [];

  if (resultsRes.status === "fulfilled" && resultsRes.value.ok) {
    const data = await resultsRes.value.json();
    race = data?.MRData?.RaceTable?.Races?.[0];
    results = race?.Results || [];
  }

  if (qualifyingRes.status === "fulfilled" && qualifyingRes.value.ok) {
    const data = await qualifyingRes.value.json();
    const qRace = data?.MRData?.RaceTable?.Races?.[0];
    qualifyingResults = qRace?.QualifyingResults || [];
  }

  if (!race || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
          No results available for this race yet.
        </p>
      </div>
    );
  }

  // Driver headshots from OpenF1
  let driverImages: Record<string, string> = {};
  try {
    const openF1Res = await fetch(
      "https://api.openf1.org/v1/drivers?session_key=latest",
      { next: { revalidate: 3600 } }
    );
    const openF1Data = await openF1Res.json();
    if (Array.isArray(openF1Data)) {
      openF1Data.forEach((d: any) => {
        driverImages[String(d.driver_number)] = (d.headshot_url || "").replace(
          "1col",
          "4col"
        );
      });
    }
  } catch (e) {
    /* silent */
  }

  // Circuit image
  let circuitImage = "";
  try {
    const year = new Date().getFullYear();
    const meetingsRes = await fetch(
      `https://api.openf1.org/v1/meetings?year=${year}`,
      { next: { revalidate: 3600 } }
    );
    const meetingsData = await meetingsRes.json();
    if (Array.isArray(meetingsData)) {
      const matched = meetingsData.find(
        (m: any) => m.country_name === race.Circuit.Location.country
      );
      if (matched) circuitImage = matched.circuit_image || "";
    }
  } catch (e) {
    /* silent */
  }

  const winner = results[0];
  const podium = results.slice(0, 3);

  // Key events
  const retirements = results.filter(
    (r: any) => !r.status.startsWith("+") && r.status !== "Finished"
  );
  const fastestLapHolder = results.find((r: any) => r.FastestLap?.rank === "1");

  // Qualifying positions for grid-vs-race delta
  const qualiPositions: Record<string, number> = {};
  qualifyingResults.forEach((q: any) => {
    qualiPositions[
      `${q.Driver.givenName} ${q.Driver.familyName}`
    ] = parseInt(q.position);
  });

  const winnerTeamColor = `#${TEAM_COLORS[winner.Constructor.name.toLowerCase()] || "E80020"}`;
  const winnerHeadshot = driverImages[winner.number];

  return (
    <div className="flex flex-col gap-12">
      {/* ── WINNER HERO ── */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 70% 50%, ${winnerTeamColor} 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch">
          {/* Info */}
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-3 block">
              Race Winner
            </span>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
              {winner.Driver.givenName}
              <br />
              <span style={{ color: winnerTeamColor }}>
                {winner.Driver.familyName}
              </span>
            </h2>
            <p className="text-zinc-400 font-mono text-sm mt-3 uppercase tracking-widest">
              {winner.Constructor.name}
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-6">
              {[
                { label: "Time", value: winner.Time?.time || "—" },
                { label: "Points", value: winner.points },
                { label: "Grid", value: `P${winner.grid}` },
                { label: "Laps", value: winner.laps },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                    {label}
                  </p>
                  <p className="text-white font-black font-mono text-lg">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Headshot */}
          <div className="relative flex items-end justify-center w-full md:w-72 overflow-hidden min-h-[180px]">
            {circuitImage && (
              <img // eslint-disable-line @next/next/no-img-element
                src={circuitImage}
                alt="Circuit layout"
                className="absolute inset-0 w-full h-full object-contain opacity-[0.07] scale-125 filter contrast-125 pointer-events-none"
              />
            )}
            {winnerHeadshot ? (
              <img // eslint-disable-line @next/next/no-img-element
                src={winnerHeadshot}
                alt={`${winner.Driver.givenName} ${winner.Driver.familyName}`}
                className="relative z-10 h-64 w-auto object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
                <span className="text-4xl font-black text-zinc-600 italic">
                  {winner.Driver.code}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PODIUM ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-1 bg-red-600" />
          <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">
            Podium
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[podium[1], podium[0], podium[2]].map((result, i) => {
            if (!result) return <div key={i} />;
            const teamColor = `#${TEAM_COLORS[result.Constructor.name.toLowerCase()] || "333"}`;
            const heights = ["h-36", "h-48", "h-28"];
            const podiumPos = [2, 1, 3];
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-zinc-300 text-xs font-black font-mono uppercase tracking-widest">
                  {result.Driver.code}
                </span>
                <span className="text-zinc-600 text-[10px] font-mono truncate max-w-full px-1 text-center">
                  {result.Constructor.name}
                </span>
                <div
                  className={`w-full ${heights[i]} rounded-t-xl flex flex-col items-center justify-start pt-3 relative overflow-hidden`}
                  style={{
                    background: `linear-gradient(to bottom, ${teamColor}44, ${teamColor}11)`,
                    borderTop: `3px solid ${teamColor}`,
                  }}
                >
                  <span className="text-5xl font-black italic text-white/8 absolute top-1 select-none">
                    {podiumPos[i]}
                  </span>
                  <span className="relative z-10 text-2xl font-black italic text-white">
                    P{podiumPos[i]}
                  </span>
                  {result.Time?.time && (
                    <span className="text-[10px] text-zinc-400 font-mono mt-1 relative z-10">
                      {result.Time.time}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── KEY EVENTS ── */}
      {(retirements.length > 0 || fastestLapHolder) && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-1 bg-red-600" />
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">
              Key Events
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fastestLapHolder && (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-purple-500/20 bg-purple-600/5">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                    Fastest Lap
                  </p>
                  <p className="text-white font-bold text-sm">
                    {fastestLapHolder.Driver.givenName}{" "}
                    {fastestLapHolder.Driver.familyName}
                  </p>
                  <p className="text-zinc-500 text-xs font-mono">
                    {fastestLapHolder.FastestLap?.Time?.time} — Lap{" "}
                    {fastestLapHolder.FastestLap?.lap}
                  </p>
                </div>
              </div>
            )}
            {retirements.slice(0, 8).map((r: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-zinc-500 italic">
                    {r.Driver.code}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Retirement
                  </p>
                  <p className="text-zinc-300 font-bold text-sm">
                    {r.Driver.givenName} {r.Driver.familyName}
                  </p>
                  <p className={`text-xs font-mono ${statusColor(r.status)}`}>
                    {statusLabel(r.status)} — Lap {r.laps}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FULL CLASSIFICATION TABLE ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-1 bg-red-600" />
          <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">
            Full Classification
          </h3>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                {["Pos", "Driver", "Constructor", "Grid", "Laps", "Time / Status", "Pts"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500
                        ${i === 2 ? "hidden md:table-cell" : ""}
                        ${i === 3 ? "hidden sm:table-cell" : ""}
                        ${i === 4 ? "hidden lg:table-cell" : ""}
                      `}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {results.map((result: any, i: number) => {
                const teamColor = `#${TEAM_COLORS[result.Constructor.name.toLowerCase()] || "333"}`;
                const isP1 = result.position === "1";
                const finished =
                  result.status === "Finished" || result.status.startsWith("+");
                const hasFastestLap = result.FastestLap?.rank === "1";
                const fullName = `${result.Driver.givenName} ${result.Driver.familyName}`;
                const qualiPos = qualiPositions[fullName];
                const posDiff = qualiPos ? qualiPos - parseInt(result.position) : null;

                return (
                  <tr
                    key={i}
                    className={`border-b border-zinc-800/50 transition-colors
                      ${isP1 ? "bg-zinc-900/60" : "hover:bg-zinc-900/30"}
                      ${!finished ? "opacity-60" : ""}
                    `}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`font-black italic text-base ${isP1 ? "text-white" : "text-zinc-400"}`}
                      >
                        {result.position}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1 h-6 rounded-full flex-shrink-0"
                          style={{ background: teamColor }}
                        />
                        <div>
                          <p
                            className={`font-black uppercase text-xs tracking-tight ${isP1 ? "text-white" : "text-zinc-200"}`}
                          >
                            {result.Driver.givenName}{" "}
                            <span className="text-zinc-400">
                              {result.Driver.familyName}
                            </span>
                          </p>
                          {hasFastestLap && (
                            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">
                              ⚡ Fastest Lap
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-zinc-500 text-xs font-mono">
                        {result.Constructor.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500 text-xs font-mono">
                          P{result.grid}
                        </span>
                        {posDiff !== null && posDiff !== 0 && (
                          <span
                            className={`text-[9px] font-black ${posDiff > 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {posDiff > 0 ? `+${posDiff}` : posDiff}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-zinc-500 text-xs font-mono">
                        {result.laps}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-mono ${statusColor(result.status)}`}
                      >
                        {statusLabel(result.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-black ${parseInt(result.points) > 0 ? "text-white" : "text-zinc-600"}`}
                      >
                        {result.points}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default async function RaceResultPage({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  const { round } = await params;

  const { get } = api();
  let raceName = `Round ${round}`;
  let circuitName = "";
  let country = "";
  let raceDate = "";

  try {
    const res = await get("current.json");
    if (res.ok) {
      const data = await res.json();
      const races = data?.MRData?.RaceTable?.Races || [];
      const race = races.find((r: any) => r.round === round);
      if (race) {
        raceName = race.raceName;
        circuitName = race.Circuit.circuitName;
        country = race.Circuit.Location.country;
        raceDate = race.date;
      }
    }
  } catch (e) {
    /* silent */
  }

  const formattedDate = raceDate
    ? new Date(raceDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/5 blur-[180px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20">
        {/* HEADER */}
        <div className="mb-10">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors mb-6"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 12H5M12 5l-7 7 7 7"
              />
            </svg>
            Season Schedule
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-8">
            <div>
              <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest mb-2">
                Round {round} • {country}
              </p>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter leading-none">
                {raceName}
              </h1>
              {circuitName && (
                <p className="text-zinc-500 font-mono text-sm mt-2 uppercase tracking-widest">
                  {circuitName}
                </p>
              )}
            </div>
            {formattedDate && (
              <span className="text-zinc-600 font-mono text-sm uppercase tracking-widest pb-1">
                {formattedDate}
              </span>
            )}
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-64 rounded-3xl bg-zinc-900/40 border border-zinc-800" />
              <div className="h-48 rounded-2xl bg-zinc-900/40 border border-zinc-800" />
              <div className="h-96 rounded-2xl bg-zinc-900/40 border border-zinc-800" />
            </div>
          }
        >
          <RaceResultsContent round={round} />
        </Suspense>
      </div>
    </div>
  );
}
