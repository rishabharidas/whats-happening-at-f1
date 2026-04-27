import api from "@/utils/api";
import { Driver } from "@/types/drivers";
import Image from "next/image";

export default async function Results({ drivers }: { drivers: Driver[] }) {
  const { get } = api();
  const today = new Date().toISOString().split(".")[0];

  const completed_sessions_response = await get(
    `sessions?is_cancelled=false&session_type=Race&date_end<${today}`,
  );
  const completed_session = await completed_sessions_response.json();

  const lastSession = completed_session[completed_session.length - 1];
  const session_key = lastSession?.session_key;
  const sessionName = lastSession?.circuit_short_name;

  const results_response = await get(
    `session_result?session_key=${session_key}&position<=3`,
  );
  const results = await results_response.json();

  const resultData = results.map((result) => ({
    ...result,
    ...drivers.find(
      (driver) =>
        driver.driver_number === result.driver_number &&
        driver.session_key === session_key,
    ),
  }));

  // Helper for the podium order: P2, P1, P3
  const podiumOrder = [resultData[1], resultData[0], resultData[2]];

  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden w-full">
      <div className="text-center mb-12">
        <h3 className="text-blue-500 font-mono tracking-widest uppercase text-sm mb-2">
          Latest Grand Prix
        </h3>
        <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter">
          {sessionName} <span className="text-zinc-700">Results</span>
        </h2>
      </div>

      <div className="flex items-end justify-center w-full max-w-4xl gap-2 md:gap-6 h-[400px]">
        {podiumOrder.map((driver, index) => {
          const isWinner = driver?.position === 1;
          const heightClass = isWinner
            ? "h-64"
            : driver?.position === 2
              ? "h-48"
              : "h-36";
          const bgColor = `#${driver?.team_colour || "333"}`;

          return (
            <div
              key={driver?.driver_number}
              className="relative flex flex-col items-center flex-1 max-w-[200px]"
            >
              {/* Driver Image with "Pop-out" effect */}
              <div
                className={`relative z-10 transition-transform duration-500 hover:scale-105 ${isWinner ? "w-32 md:w-44" : "w-24 md:w-32"}`}
              >
                {isWinner && (
                  <div className="absolute inset-0 bg-white/20 blur-[60px] rounded-full animate-pulse" />
                )}
                <Image
                  src={driver?.headshot_url}
                  alt={driver?.full_name}
                  width={200}
                  height={200}
                  className="object-contain drop-shadow-2xl"
                />
              </div>

              {/* Podium Pedestal */}
              <div
                className={`relative w-full ${heightClass} flex flex-col items-center justify-start pt-4 rounded-t-xl overflow-hidden`}
                style={{
                  background: `linear-gradient(to bottom, ${bgColor}CC, #1a1a1a)`,
                  borderTop: `4px solid ${bgColor}`,
                }}
              >
                {/* Big Background Number */}
                <span className="absolute top-2 text-6xl md:text-8xl font-black text-white/10 italic select-none">
                  {driver?.position}
                </span>

                <div className="z-20 text-center px-2">
                  <p className="text-xs md:text-sm font-bold text-white/60 uppercase">
                    {driver?.name_acronym}
                  </p>
                  <p className="hidden md:block text-xs font-medium text-white/40 truncate">
                    {driver?.team_name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
