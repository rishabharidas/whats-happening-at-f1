import React from "react";
import { TEAM_COLORS } from "@/utils/sessionResults";

export default function SprintClassification({
  results,
  sessionName = "Sprint",
}: {
  results: any[];
  sessionName?: string;
}) {
  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
          No results available for {sessionName} yet.
        </p>
      </div>
    );
  }

  const winner = results[0];
  const winnerTeamColor = `#${
    TEAM_COLORS[winner.Constructor?.name?.toLowerCase() || ""] || "E80020"
  }`;

  return (
    <div className="flex flex-col gap-10">
      {/* ── SPRINT WINNER HERO ── */}
      {winner && (
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 70% 50%, ${winnerTeamColor} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch justify-between p-8 md:p-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 block">
                  {sessionName} Winner
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono bg-zinc-800 text-zinc-300">
                  P1 • 8 Pts
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                {winner.Driver?.givenName}
                <br />
                <span style={{ color: winnerTeamColor }}>
                  {winner.Driver?.familyName}
                </span>
              </h2>

              <p className="text-zinc-400 font-mono text-sm mt-3 uppercase tracking-widest">
                {winner.Constructor?.name}
              </p>

              <div className="flex flex-wrap items-center gap-8 mt-6">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Time
                  </p>
                  <p className="text-white font-black font-mono text-2xl md:text-3xl text-emerald-400">
                    {winner.Time?.time || "Finished"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Laps
                  </p>
                  <p className="text-white font-black font-mono text-2xl md:text-3xl">
                    {winner.laps}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Grid
                  </p>
                  <p className="text-white font-black font-mono text-2xl md:text-3xl">
                    P{winner.grid}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SPRINT TABLE ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-1 bg-red-600" />
          <h3 className="text-lg font-black italic uppercase text-white tracking-tighter">
            {sessionName} Classification
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
              {results.map((r, i) => {
                const teamColor = `#${
                  TEAM_COLORS[r.Constructor?.name?.toLowerCase() || ""] || "333"
                }`;
                const isP1 = r.position === "1";
                const isPoints = parseInt(r.points || "0", 10) > 0;

                return (
                  <tr
                    key={i}
                    className={`border-b border-zinc-800/50 transition-colors
                      ${isP1 ? "bg-zinc-900/60" : "hover:bg-zinc-900/30"}
                    `}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`font-black italic text-base ${isP1 ? "text-white" : "text-zinc-400"}`}
                      >
                        {r.position}
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
                            {r.Driver?.givenName}{" "}
                            <span className="text-zinc-400">
                              {r.Driver?.familyName}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-zinc-500 text-xs font-mono">
                        {r.Constructor?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-zinc-500 text-xs font-mono">
                        P{r.grid}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-zinc-500 text-xs font-mono">
                        {r.laps}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-zinc-300">
                        {r.Time?.time || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-black ${isPoints ? "text-white" : "text-zinc-600"}`}
                      >
                        {r.points}
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
