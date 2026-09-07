import React from "react";
import { QualifyingResultRow } from "@/utils/sessionResults";

export default function QualifyingClassification({
  results,
  sessionName = "Qualifying",
}: {
  results: QualifyingResultRow[];
  sessionName?: string;
}) {
  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
          No qualifying results available yet.
        </p>
      </div>
    );
  }

  const poleSitter = results[0];
  const top3 = results.slice(0, 3);

  // Best time for pole sitter: Q3 or Q2 or Q1
  const poleTime = poleSitter.q3 !== "—" ? poleSitter.q3 : poleSitter.q2 !== "—" ? poleSitter.q2 : poleSitter.q1;

  return (
    <div className="flex flex-col gap-10">
      {/* ── POLE SITTER HERO ── */}
      {poleSitter && (
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 70% 50%, ${poleSitter.teamColor} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch justify-between">
            {/* Pole Info */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 block">
                  Pole Position
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono bg-zinc-800 text-zinc-300">
                  P1
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                {poleSitter.driverName.split(" ").slice(0, -1).join(" ")}
                <br />
                <span style={{ color: poleSitter.teamColor }}>
                  {poleSitter.driverName.split(" ").slice(-1).join(" ")}
                </span>
              </h2>

              <p className="text-zinc-400 font-mono text-sm mt-3 uppercase tracking-widest">
                {poleSitter.teamName}
              </p>

              <div className="flex flex-wrap items-center gap-8 mt-6">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Pole Time
                  </p>
                  <p className="text-white font-black font-mono text-2xl md:text-3xl text-emerald-400">
                    {poleTime}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Car #
                  </p>
                  <p className="text-white font-black font-mono text-2xl md:text-3xl">
                    {poleSitter.driverNumber}
                  </p>
                </div>
                {poleSitter.q1 !== "—" && (
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                      Q1 Time
                    </p>
                    <p className="text-zinc-300 font-mono text-lg font-bold">
                      {poleSitter.q1}
                    </p>
                  </div>
                )}
                {poleSitter.q2 !== "—" && (
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                      Q2 Time
                    </p>
                    <p className="text-zinc-300 font-mono text-lg font-bold">
                      {poleSitter.q2}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Driver Headshot */}
            {poleSitter.headshotUrl && (
              <div className="w-full md:w-80 flex items-center justify-center p-6 relative min-h-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={poleSitter.headshotUrl}
                  alt={poleSitter.driverName}
                  className="w-44 md:w-56 h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] filter contrast-105 pointer-events-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TOP 3 ROW ── */}
      {top3.length > 1 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 bg-red-600" />
            <h3 className="text-lg font-black italic uppercase text-white tracking-tighter">
              Front of the Grid
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {top3.map((d) => {
              const bestTime = d.q3 !== "—" ? d.q3 : d.q2 !== "—" ? d.q2 : d.q1;
              return (
                <div
                  key={d.position}
                  className="relative overflow-hidden p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: d.teamColor }}
                  />
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
                      P{d.position} • {d.teamName}
                    </span>
                    <h4 className="text-base font-black italic text-white uppercase tracking-tight">
                      {d.driverName}
                    </h4>
                    <p className="text-emerald-400 font-mono text-sm font-black mt-1">
                      {bestTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-zinc-400 font-bold">
                      #{d.driverNumber}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-600 block">
                      {d.driverCode}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── QUALIFYING TABLE ── */}
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
                {["Pos", "Driver", "Constructor", "Q1", "Q2", "Q3"].map((h, i) => (
                  <th
                    key={h}
                    className={`text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500
                      ${i === 2 ? "hidden md:table-cell" : ""}
                      ${i === 4 ? "hidden sm:table-cell" : ""}
                    `}
                  >
                    {h}
                  </th>
                ))}
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
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-zinc-400 text-xs font-mono">
                        {row.teamName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-zinc-400">
                        {row.q1}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs font-mono text-zinc-300">
                        {row.q2}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-mono font-bold ${
                          row.q3 !== "—" ? (isP1 ? "text-emerald-400" : "text-white") : "text-zinc-600"
                        }`}
                      >
                        {row.q3}
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
