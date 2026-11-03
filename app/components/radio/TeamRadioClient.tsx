"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { RadioTransmission, RadioCategory } from "@/types/radio";
import TeamLogo from "@/components/TeamLogo";

interface TeamRadioClientProps {
  initialTransmissions: RadioTransmission[];
}

const CATEGORIES: { label: string; value: RadioCategory }[] = [
  { label: "All Frequencies", value: "ALL" },
  { label: "Victory Radio", value: "VICTORY" },
  { label: "Pit Strategy", value: "STRATEGY" },
  { label: "Drama & Orders", value: "DRAMA" },
  { label: "Overtakes", value: "OVERTAKE" },
];

export default function TeamRadioClient({ initialTransmissions }: TeamRadioClientProps) {
  const [transmissions] = useState<RadioTransmission[]>(initialTransmissions);
  const [selectedCategory, setSelectedCategory] = useState<RadioCategory>("ALL");
  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState<RadioTransmission | null>(
    initialTransmissions.find((t) => t.featured) || initialTransmissions[0] || null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(7);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio element for real OpenF1 recordings
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // AudioContext for telemetry squelch & pit-wall radio beeps
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get unique teams for filter
  const teams = useMemo(() => {
    const set = new Set<string>();
    transmissions.forEach((t) => set.add(t.teamName));
    return Array.from(set);
  }, [transmissions]);

  // Filter transmissions
  const filteredTransmissions = useMemo(() => {
    return transmissions.filter((item) => {
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      if (selectedTeam !== "ALL" && item.teamName !== selectedTeam) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          item.transcript.toLowerCase().includes(q) ||
          item.driverName.toLowerCase().includes(q) ||
          item.driverCode.toLowerCase().includes(q) ||
          item.teamName.toLowerCase().includes(q) ||
          item.sessionName.toLowerCase().includes(q) ||
          (item.speakerName && item.speakerName.toLowerCase().includes(q));
        if (!matchesText) return false;
      }
      return true;
    });
  }, [transmissions, selectedCategory, selectedTeam, searchQuery]);

  // AudioContext Radio Squelch sound effect generator
  const playRadioBeep = useCallback((isEnd = false) => {
    if (typeof window === "undefined" || isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      gain.gain.setValueAtTime(0.04 * volume, now);

      if (!isEnd) {
        // Dual-tone start chirp: 880Hz -> 1320Hz
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else {
        // End click: 520Hz short click
        osc.frequency.setValueAtTime(520, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch {
      // AudioContext optional fallback
    }
  }, [isMuted, volume]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Update volume on audioRef
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Play/Pause
  const togglePlay = (item: RadioTransmission) => {
    if (activeItem?.id === item.id && isPlaying) {
      // Pause
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      playRadioBeep(true);
      return;
    }

    // Play new or resumed item
    if (timerRef.current) clearInterval(timerRef.current);

    setActiveItem(item);
    setIsPlaying(true);
    setCurrentTime(0);
    const itemDuration = item.durationSeconds || 7;
    setDuration(itemDuration);

    playRadioBeep(false);

    if (item.recordingUrl) {
      // Real audio playback
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      audio.src = item.recordingUrl;
      audio.volume = isMuted ? 0 : volume;
      audio.play().catch(() => {
        // If external audio playback is blocked, run simulated playback
        startSimulatedPlayback(itemDuration);
      });

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        playRadioBeep(true);
      };
    } else {
      // Simulated radio transmission playback
      startSimulatedPlayback(itemDuration);
    }
  };

  const startSimulatedPlayback = (totalSec: number) => {
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= totalSec) {
        setIsPlaying(false);
        setCurrentTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
        playRadioBeep(true);
      } else {
        setCurrentTime(elapsed);
      }
    }, 100);
  };

  const handleCopyTranscript = (item: RadioTransmission) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `"${item.transcript}" — ${item.driverName} (${item.teamName}), ${item.sessionName}`
      );
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* ------------------------------------------------------------- */}
      {/* TELEMETRY FREQUENCY HUD & ACTIVE PLAYER                      */}
      {/* ------------------------------------------------------------- */}
      {activeItem && (
        <section
          aria-label="Active Radio Broadcast Console"
          className="relative rounded-3xl bg-[#121318] border border-zinc-800 p-6 md:p-8 overflow-hidden shadow-2xl transition-all"
        >
          {/* Ambient Glow */}
          <div
            className="absolute top-0 right-0 w-96 h-96 blur-3xl opacity-15 pointer-events-none rounded-full"
            style={{ backgroundColor: activeItem.teamColour || "#E80020" }}
          />

          <div className="flex flex-col gap-6 relative z-10">
            {/* Top Bar: Radio Frequency Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isPlaying ? "bg-red-500" : "bg-emerald-500"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      isPlaying ? "bg-red-600" : "bg-emerald-500"
                    }`}
                  />
                </span>
                <span className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">
                  {isPlaying ? "Transmitting Radio Feed" : "Monitoring Pit Channel"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                  452.125 MHz
                </span>
                {activeItem.isLiveFeed && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 text-red-400 border border-red-800/60 animate-pulse">
                    LIVE OPENF1
                  </span>
                )}
              </div>

              {/* Volume / Mute Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? "Unmute pit radio" : "Mute pit radio"}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                >
                  {isMuted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  aria-label="Pit wall radio volume"
                  className="w-20 md:w-28 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            </div>

            {/* Middle: Active Transmission Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Driver & Speaker Info (Left 4 cols) */}
              <div className="lg:col-span-4 flex items-center gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg">
                  {activeItem.headshotUrl ? (
                    <Image
                      src={activeItem.headshotUrl}
                      alt={activeItem.driverName}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                      priority
                    />
                  ) : (
                    <span className="text-xl font-mono font-black italic text-zinc-500">
                      {activeItem.driverCode}
                    </span>
                  )}
                  {/* Driver Number Badge */}
                  <div
                    className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-black text-black shadow"
                    style={{ backgroundColor: activeItem.teamColour || "#FFFFFF" }}
                  >
                    #{activeItem.driverNumber}
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      {activeItem.speaker === "DRIVER" ? "Cockpit Voice" : "Pit Wall Command"}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: activeItem.teamColour }}
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white tracking-tight truncate">
                    {activeItem.speakerName || activeItem.driverName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <TeamLogo teamName={activeItem.teamName} size={14} className="w-3.5 h-3.5 opacity-80" />
                    <span className="text-xs font-mono text-zinc-400 truncate">
                      {activeItem.teamName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transcript & Waveform HUD (Right 8 cols) */}
              <div className="lg:col-span-8 flex flex-col justify-between gap-4">
                <blockquote className="text-base sm:text-lg md:text-xl font-sans italic text-white font-medium leading-relaxed">
                  &ldquo;{activeItem.transcript}&rdquo;
                </blockquote>

                {/* Session Context Tag */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="text-zinc-500">SESSION:</span>
                  <span className="text-zinc-300 font-semibold">{activeItem.sessionName}</span>
                  {activeItem.lap && (
                    <span className="text-red-400 font-bold">• Lap {activeItem.lap}</span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300">
                    {activeItem.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Controls: Play Button, Waveform Equalizer, Timeline */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-zinc-800/80">
              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={() => togglePlay(activeItem)}
                aria-label={isPlaying ? "Pause transmission" : "Play transmission"}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-mono font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 transition-all cursor-pointer flex-shrink-0"
              >
                {isPlaying ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    <span>Pause Radio</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 3l14 9-14 9V3z" />
                    </svg>
                    <span>Play Transmission</span>
                  </>
                )}
              </button>

              {/* Scrubber & Audio Waveform Visualizer */}
              <div className="flex-1 w-full flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="text-red-400 font-bold tabular-nums">
                    {formatSeconds(currentTime)}
                  </span>
                  {/* Equalizer Frequency Bars */}
                  <div className="flex items-end gap-1 h-5 px-3" aria-hidden="true">
                    {[
                      12, 20, 8, 24, 16, 28, 10, 22, 14, 26, 18, 12, 24, 14, 20, 16, 22, 10,
                    ].map((height, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          isPlaying ? "bg-red-500" : "bg-zinc-700"
                        }`}
                        style={{
                          height: isPlaying
                            ? `${Math.max(4, Math.sin(currentTime * 8 + i) * height + 10)}px`
                            : "4px",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-zinc-500 tabular-nums">{formatSeconds(duration)}</span>
                </div>

                {/* Progress bar */}
                <div
                  className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    const newTime = pos * duration;
                    setCurrentTime(newTime);
                    if (audioRef.current && audioRef.current.duration) {
                      audioRef.current.currentTime = newTime;
                    }
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-100"
                    style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Copy Quote Button */}
              <button
                type="button"
                onClick={() => handleCopyTranscript(activeItem)}
                aria-label="Copy radio transcript"
                className="px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer flex-shrink-0"
              >
                {copiedId === activeItem.id ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    <span>Copy Quote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FILTER & SEARCH BAR                                          */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Filters and Search" className="flex flex-col gap-4">
        {/* Category Pills & Search Input */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.value
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                    : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative min-w-[240px] md:w-72">
            <svg
              className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search driver, transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Team Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs font-mono">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
            Constructors:
          </span>
          <button
            type="button"
            onClick={() => setSelectedTeam("ALL")}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedTeam === "ALL"
                ? "bg-zinc-200 text-black font-bold"
                : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            All
          </button>
          {teams.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTeam(t)}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                selectedTeam === t
                  ? "bg-zinc-200 text-black font-bold"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <TeamLogo teamName={t} size={12} className="w-3 h-3" />
              <span>{t}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* TRANSMISSIONS FEED GRID                                       */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Team Radio Transmissions Feed" className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
          <span>{filteredTransmissions.length} Transmissions Recorded</span>
          <span className="text-zinc-500">Pit Wall Encrypted Stream</span>
        </div>

        {filteredTransmissions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800 flex flex-col items-center justify-center gap-3">
            <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
              />
            </svg>
            <p className="text-sm font-mono text-zinc-400">
              No radio comms found matching your search filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedTeam("ALL");
                setSearchQuery("");
              }}
              className="text-xs font-mono font-bold text-red-500 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTransmissions.map((item) => {
              const isItemPlaying = activeItem?.id === item.id && isPlaying;

              return (
                <div
                  key={item.id}
                  onClick={() => togglePlay(item)}
                  className={`group relative rounded-2xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 ${
                    isItemPlaying
                      ? "bg-[#161820] border-red-500 shadow-xl shadow-red-500/10"
                      : "bg-[#121318] hover:bg-[#15171e] border-zinc-800/80 hover:border-zinc-700"
                  }`}
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: item.teamColour || "#E80020",
                  }}
                >
                  {/* Top Bar: Driver, Team, Category Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                        {item.headshotUrl ? (
                          <Image
                            src={item.headshotUrl}
                            alt={item.driverName}
                            fill
                            sizes="40px"
                            className="object-cover object-top"
                          />
                        ) : (
                          <span className="text-xs font-mono font-bold text-zinc-400">
                            {item.driverCode}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-white uppercase truncate">
                            {item.driverName}
                          </span>
                          <span
                            className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                            style={{
                              backgroundColor: `${item.teamColour}22`,
                              color: item.teamColour,
                            }}
                          >
                            #{item.driverNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 truncate">
                          <TeamLogo teamName={item.teamName} size={12} className="w-3 h-3 opacity-70" />
                          <span className="truncate">{item.teamName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                        {item.category}
                      </span>
                      {item.lap && (
                        <span className="text-[10px] font-mono text-zinc-500">
                          Lap {item.lap}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transcript quote */}
                  <p className="text-sm font-sans italic text-zinc-200 group-hover:text-white leading-relaxed line-clamp-3">
                    &ldquo;{item.transcript}&rdquo;
                  </p>

                  {/* Footer Bar: Play Action, Session Context, Copy */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay(item);
                        }}
                        aria-label={isItemPlaying ? "Pause transmission" : "Play transmission"}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isItemPlaying
                            ? "bg-red-600 text-white shadow-md shadow-red-600/40"
                            : "bg-zinc-800 group-hover:bg-red-600 text-zinc-300 group-hover:text-white"
                        }`}
                      >
                        {isItemPlaying ? (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 3l14 9-14 9V3z" />
                          </svg>
                        )}
                      </button>

                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white group-hover:text-red-400 transition-colors">
                          {isItemPlaying ? "Now Playing" : "Listen Comms"}
                        </span>
                        <span className="text-[10px] text-zinc-500 truncate max-w-[180px] sm:max-w-[220px]">
                          {item.sessionName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Audio wave pulse when active */}
                      {isItemPlaying && (
                        <div className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
                          <span className="w-0.5 bg-red-500 rounded-full animate-pulse h-2" />
                          <span className="w-0.5 bg-red-500 rounded-full animate-pulse h-3.5 delay-75" />
                          <span className="w-0.5 bg-red-500 rounded-full animate-pulse h-1.5 delay-150" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyTranscript(item);
                        }}
                        title="Copy quote"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        {copiedId === item.id ? (
                          <span className="text-[10px] text-emerald-400 font-bold">Copied</span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* PADDOCK PODCAST / SPOTIFY EMBED (FROM AUDIO CENTER)           */}
      {/* ------------------------------------------------------------- */}
      <section className="border border-zinc-800 bg-zinc-950/60 p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col gap-6 w-full mt-4">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="h-6 w-1 bg-red-600" />
          <h3 className="text-xl font-black italic uppercase text-white tracking-tight">
            Official F1 <span className="text-red-600">Podcasts & Shows</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 flex flex-col gap-2">
            <span className="text-zinc-500 text-[10px] font-mono font-bold uppercase tracking-wider">
              Beyond The Grid Official Spotify Stream
            </span>
            <iframe
              style={{ borderRadius: "16px" }}
              src="https://open.spotify.com/embed/show/4NGpuDYjOYyVzH6OqZXtCF?utm_source=generator&theme=0"
              width="100%"
              height="280"
              frameBorder="0"
              allowFullScreen={false}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>

          <div className="lg:col-span-1 flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-2.5">
              <span className="text-zinc-500 text-[10px] font-mono font-bold uppercase tracking-wider">
                External Broadcast Feeds
              </span>
              {[
                {
                  name: "F1 TV Pro Audio",
                  desc: "Unedited live cockpit team radio on board F1 TV.",
                  url: "https://f1tv.formula1.com",
                  badge: "Live Feed",
                },
                {
                  name: "F1 YouTube Vault",
                  desc: "Team radio compilations & race debriefs.",
                  url: "https://www.youtube.com/user/Formula1",
                  badge: "Video",
                },
              ].map((channel) => (
                <a
                  key={channel.name}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all text-xs font-mono"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-white uppercase">{channel.name}</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">{channel.desc}</span>
                  </div>
                  <svg className="w-4 h-4 text-zinc-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>

            <div className="p-3 bg-zinc-900/30 border border-zinc-800/80 rounded-xl text-[10px] font-mono text-zinc-400">
              * Transmissions recorded from official FIA team radio channels and OpenF1 open telemetry feeds.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
