import React from "react";
import TeamLogo from "@/components/TeamLogo";
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
    <div className="flex flex-col gap-10 w-full max-w-full overflow-x-hidden">
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

              <div className="flex items-center gap-2 mt-3">
                <span className="w-5 h-5 rounded-full bg-zinc-950/80 border border-white/10 flex items-center justify-center p-0.5 shadow-sm">
                  <TeamLogo teamName={winner.Constructor?.name || ""} size={14} className="w-3.5 h-3.5 object-contain" />
                </span>
                <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">
                  {winner.Constructor?.name}
                </p>
              </div>

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
                {["Pos", "Driver", "Constructor", "Grid", "Laps", "Time / Gap", "Interval", "Pts"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500
                        ${i === 2 ? "hidden md:table-cell" : ""}
                        ${i === 3 ? "hidden sm:table-cell" : ""}
                        ${i === 4 ? "hidden lg:table-cell" : ""}
                        ${i === 6 ? "hidden sm:table-cell" : ""}
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
                const finished = r.status === "Finished" || r.status?.startsWith("+");

                // Calculate interval to car ahead
                let intervalDisplay = "—";
                if (isP1) {
                  intervalDisplay = "LEADER";
                } else if (finished) {
                  const prev = results[i - 1];
                  if (r.Time?.millis && prev?.Time?.millis) {
                    const diffMs = parseInt(r.Time.millis, 10) - parseInt(prev.Time.millis, 10);
                    if (!isNaN(diffMs) && diffMs >= 0) {
                      intervalDisplay = `+${(diffMs / 1000).toFixed(3)}s`;
                    }
                  } else if (i === 1 && r.Time?.time) {
                    const clean = r.Time.time.replace(/s$/i, "");
                    intervalDisplay = clean.startsWith("+") ? `${clean}s` : `+${clean}s`;
                  }
                }

                return (
                  <tr
                    key={i}
                    className={`border-b border-zinc-800/50 transition-colors
                      ${isP1 ? "bg-zinc-900/60" : "hover:bg-zinc-900/30"}
                    `}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`font-black italic text-base ${isP1 ? "text-amber-400" : "text-zinc-400"}`}
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
                          <div className="flex md:hidden items-center gap-1.5 mt-0.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center p-0.5 flex-shrink-0">
                              <TeamLogo teamName={r.Constructor?.name || ""} size={10} className="w-2.5 h-2.5 object-contain" />
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono truncate">
                              {r.Constructor?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center bg-zinc-900 border border-white/10 p-0.5">
                          <TeamLogo teamName={r.Constructor?.name || ""} size={12} className="w-3 h-3 object-contain" />
                        </div>
                        <span className="text-zinc-400 text-xs font-mono truncate">
                          {r.Constructor?.name}
                        </span>
                      </div>
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
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-mono font-bold ${
                            isP1
                              ? "text-amber-400 font-black"
                              : finished
                                ? "text-zinc-200"
                                : "text-zinc-500"
                          }`}
                        >
                          {isP1 ? (r.Time?.time || "Winner") : (r.Time?.time ? (r.Time.time.startsWith("+") ? `${r.Time.time}s` : `+${r.Time.time}s`) : r.status)}
                        </span>
                        {intervalDisplay !== "—" && !isP1 && (
                          <span className="sm:hidden text-[9px] font-mono text-zinc-500">
                            Int: {intervalDisplay}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`text-xs font-mono ${
                          isP1
                            ? "text-zinc-500 font-bold"
                            : intervalDisplay !== "—"
                              ? "text-zinc-400 font-semibold"
                              : "text-zinc-600"
                        }`}
                      >
                        {intervalDisplay}
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
