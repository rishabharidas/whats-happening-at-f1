import { SessionDetails } from "@/types/session";
import api from "@/utils/api";

export default async function UpcomingSession({
  sessions,
}: {
  sessions: SessionDetails[];
}) {
  const today = new Date().toISOString().split(".")[0];

  const upcomingSessions = sessions.filter(
    (session: SessionDetails) => session.date_start > today,
  );

  // The Big Feature Session
  const mainSession = upcomingSessions[0];
  // The next 3 sessions
  const secondarySessions = upcomingSessions.slice(1, 4);

  if (!mainSession) return null;

  // Fetch dynamic meeting/circuit preview data from OpenF1 API
  let meetingData: any = null;
  const year = mainSession.date_start ? new Date(mainSession.date_start).getFullYear() : new Date().getFullYear();
  const countryName = mainSession.country_name;

  const { get } = api();

  try {
    // Primary: fetch by year and country
    const res = await get(
      `meetings?year=${year}&country_name=${encodeURIComponent(countryName)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        meetingData = data[0];
      }
    }

    // Secondary: fallback to search in all meetings of the year in case of country name mismatch
    if (!meetingData) {
      const fallbackRes = await get(`meetings?year=${year}`);
      if (fallbackRes.ok) {
        const allMeetings = await fallbackRes.json();
        if (Array.isArray(allMeetings)) {
          const normalizedCountry = countryName.toLowerCase();
          const normalizedCircuit = mainSession.circuit_short_name.toLowerCase();
          const match = allMeetings.find(
            (m: any) =>
              (m.country_name && (m.country_name.toLowerCase().includes(normalizedCountry) || normalizedCountry.includes(m.country_name.toLowerCase()))) ||
              (m.circuit_short_name && (m.circuit_short_name.toLowerCase().includes(normalizedCircuit) || normalizedCircuit.includes(m.circuit_short_name.toLowerCase())))
          );
          if (match) {
            meetingData = match;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching circuit preview from OpenF1 API:", error);
  }

  const formatSessionDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      weekday: d.toLocaleString("default", { weekday: "short" }).toUpperCase(),
    };
  };

  const mainDate = formatSessionDate(mainSession.date_start);

  return (
    <div
      id="seasons"
      className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-4 py-10"
    >
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-red-600" />
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">
            Race <span className="text-red-600">Weekend</span>
          </h2>
        </div>
        <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest hidden md:block">
          {mainSession.circuit_short_name} • {mainSession.country_name}
        </span>
      </div>

      {/* PRIMARY SESSION (Big Card) */}
      <div className="relative group overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-stretch transition-all hover:border-zinc-700">
        <div className="bg-red-600 p-8 flex flex-col items-center justify-center text-white md:w-48 border-b md:border-b-0 md:border-r border-dashed border-white/30">
          <span className="text-sm font-bold tracking-widest opacity-80">
            {mainDate.month}
          </span>
          <span className="text-6xl font-black italic leading-none my-1">
            {mainDate.day}
          </span>
          <span className="text-lg font-bold tracking-tighter">
            {mainDate.time}
          </span>
        </div>

        <div className="flex-1 p-8 flex flex-col justify-center relative">
          <span className="absolute right-4 bottom-0 text-7xl font-black text-white/3 italic pointer-events-none uppercase">
            UPNEXT
          </span>
          <div className="relative z-10">
            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">
              Upcoming Session
            </span>
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {mainSession.session_name}
            </h3>
            <p className="text-zinc-400 font-medium mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" />
              {mainSession.location}
            </p>
          </div>
        </div>

        {meetingData && (
          <div className="relative overflow-hidden md:w-80 border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-950/40 p-6 flex flex-col justify-between group/circuit min-h-[220px]">
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />

            {/* Circuit Image (Centered and full display) */}
            {meetingData.circuit_image ? (
              <div className="flex-1 flex items-center justify-center relative py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meetingData.circuit_image}
                  alt={meetingData.circuit_short_name || "Circuit Layout"}
                  className="max-w-full max-h-36 object-contain filter invert opacity-60 group-hover/circuit:opacity-100 group-hover/circuit:scale-105 transition-all duration-500 pointer-events-none brightness-200"
                />
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Bottom Row: Country & Flag */}
            <div className="relative z-10 flex items-center gap-2 border-t border-zinc-800/80 pt-3 mt-auto">
              {meetingData.country_flag && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={meetingData.country_flag}
                  alt={meetingData.country_name}
                  className="w-6 h-auto rounded-sm border border-zinc-800 shadow-sm"
                />
              )}
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                {meetingData.country_name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECONDARY SESSIONS (Mini Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {secondarySessions.map((session, idx) => {
          const sDate = formatSessionDate(session.date_start);
          return (
            <div
              key={idx}
              className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex items-center gap-4 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center border-r border-zinc-800 pr-4 min-w-[60px]">
                <span className="text-[10px] font-bold text-zinc-500">
                  {sDate.weekday}
                </span>
                <span className="text-xl font-black text-white italic">
                  {sDate.day}
                </span>
              </div>

              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-red-500 uppercase tracking-tight truncate">
                  {session.session_name}
                </span>
                <span className="text-sm font-medium text-zinc-300">
                  {sDate.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
