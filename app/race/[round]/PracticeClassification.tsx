import React from "react";
import TeamLogo from "@/components/TeamLogo";
import { PracticeResultRow } from "@/utils/sessionResults";

export default function PracticeClassification({
  results,
  sessionName,
}: {
  results: PracticeResultRow[];
  sessionName: string;
}) {
  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
          No classification data available for {sessionName} yet.
        </p>
      </div>
    );
  }

  const leader = results[0];
  const top3 = results.slice(0, 3);

  return (
    <div className="flex flex-col gap-10 w-full max-w-full overflow-x-hidden">
      {/* ── SESSION LEADER HERO ── */}
      {leader && (
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 70% 50%, ${leader.teamColor} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch justify-between">
            {/* Leader Info */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 block">
                  {sessionName} Leader
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono bg-zinc-800 text-zinc-300">
                  P1
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                {leader.driverName.split(" ").slice(0, -1).join(" ")}
                <br />
                <span style={{ color: leader.teamColor }}>
                  {leader.driverName.split(" ").slice(-1).join(" ")}
                </span>
              </h2>

              <div className="flex items-center gap-2 mt-3">
                <span className="w-5 h-5 rounded-full bg-zinc-950/80 border border-white/10 flex items-center justify-center p-0.5 shadow-sm">
                  <TeamLogo teamName={leader.teamName} size={14} className="w-3.5 h-3.5 object-contain" />
                </span>
                <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">
                  {leader.teamName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-8 mt-6">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Best Lap
                  </p>
                  <p className="text-white font-black font-mono text-2xl md:text-3xl text-emerald-400">
                    {leader.bestLapTime}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Laps Run
                  </p>
                  <p className="text-white font-black font-mono text-2xl md:text-3xl">
                    {leader.laps}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Car #
                  </p>
                  <p className="text-white font-black font-mono text-2xl md:text-3xl">
                    {leader.driverNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Headshot */}
            {leader.headshotUrl && (
              <div className="w-full md:w-80 flex items-center justify-center p-6 relative min-h-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={leader.headshotUrl}
                  alt={leader.driverName}
                  className="w-44 md:w-56 h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] filter contrast-105 pointer-events-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TOP 3 HIGHLIGHTS ── */}
      {top3.length > 1 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 bg-red-600" />
            <h3 className="text-lg font-black italic uppercase text-white tracking-tighter">
              Top 3 Times
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {top3.map((d) => (
              <div
                key={d.position}
                className="relative overflow-hidden p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: d.teamColor }}
                />
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-4 h-4 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center p-0.5 flex-shrink-0">
                      <TeamLogo teamName={d.teamName} size={11} className="w-2.5 h-2.5 object-contain" />
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest truncate">
                      P{d.position} • {d.teamName}
                    </span>
                  </div>
                  <h4 className="text-base font-black italic text-white uppercase tracking-tight">
                    {d.driverName}
                  </h4>
                  <p className="text-emerald-400 font-mono text-sm font-black mt-1">
                    {d.bestLapTime}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-zinc-400 block">
                    {d.gap}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600">
                    {d.laps} laps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FULL CLASSIFICATION TABLE ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-1 bg-red-600" />
          <h3 className="text-lg font-black italic uppercase text-white tracking-tighter">
            Full Classification
          </h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                {["Pos", "Driver", "Constructor", "Best Lap", "Gap to P1", "Laps", "Status"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500
                        ${i === 2 ? "hidden md:table-cell" : ""}
                        ${i === 5 ? "hidden sm:table-cell" : ""}
                        ${i === 6 ? "hidden lg:table-cell" : ""}
                      `}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {results.map((row) => {
                const isP1 = row.position === 1;
                return (
                  <tr
                    key={row.position}
                    className={`border-b border-zinc-800/50 transition-colors
                      ${isP1 ? "bg-zinc-900/60" : "hover:bg-zinc-900/30"}
                    `}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`font-black italic text-base ${isP1 ? "text-white" : "text-zinc-400"}`}
                      >
                        {row.position}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-1 h-6 rounded-full flex-shrink-0"
                          style={{ background: row.teamColor }}
                        />
                        <div>
                          <p
                            className={`font-black uppercase text-xs tracking-tight ${isP1 ? "text-white" : "text-zinc-200"}`}
                          >
                            {row.driverName}
                          </p>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">
                            #{row.driverNumber} {row.driverCode ? `• ${row.driverCode}` : ""}
                          </span>
                          <div className="flex md:hidden items-center gap-1.5 mt-0.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center p-0.5 flex-shrink-0">
                              <TeamLogo teamName={row.teamName} size={10} className="w-2.5 h-2.5 object-contain" />
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase truncate">
                              {row.teamName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center bg-zinc-900 border border-white/10 p-0.5">
                          <TeamLogo teamName={row.teamName} size={12} className="w-3 h-3 object-contain" />
                        </div>
                        <span className="text-zinc-400 text-xs font-mono truncate">
                          {row.teamName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-mono font-bold ${isP1 ? "text-emerald-400" : "text-zinc-200"}`}
                      >
                        {row.bestLapTime}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-zinc-400">
                        {row.gap}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-zinc-500 text-xs font-mono">
                        {row.laps}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span
                        className={`text-xs font-mono ${
                          row.status === "Finished" ? "text-zinc-500" : "text-orange-400"
                        }`}
                      >
                        {row.status}
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
