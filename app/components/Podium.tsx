import Image from "next/image";

export interface PodiumDriver {
  position: number;
  name_acronym: string;
  full_name: string;
  team_name: string;
  team_colour: string; // hex string, e.g. "E80020"
  headshot_url?: string;
  time?: string;
}

export default function Podium({ drivers }: { drivers: PodiumDriver[] }) {
  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [drivers[1], drivers[0], drivers[2]].filter(Boolean);

  return (
    <div className="flex items-end justify-center w-full max-w-4xl gap-2 md:gap-6 h-100 mx-auto mt-8">
      {podiumOrder.map((driver, index) => {
        const isWinner = driver.position === 1;
        const heightClass = isWinner
          ? "h-48 sm:h-56 md:h-64"
          : driver.position === 2
            ? "h-36 sm:h-44 md:h-48"
            : "h-24 sm:h-32 md:h-36";
        const bgColor = `#${driver.team_colour || "333"}`;

        return (
          <div
            key={index}
            className="relative flex flex-col items-center flex-1 max-w-50"
          >
            {/* Driver headshot pops out on top of pedestal */}
            <div
              className={`relative z-10 transition-transform duration-500 hover:scale-105 ${
                isWinner ? "w-28 sm:w-32 md:w-44" : "w-20 sm:w-24 md:w-32"
              }`}
            >
              {isWinner && (
                <div className="absolute inset-0 bg-white/20 blur-[60px] rounded-full animate-pulse" />
              )}
              {driver.headshot_url ? (
                <Image
                  src={driver.headshot_url}
                  alt={driver.full_name || "Driver"}
                  width={200}
                  height={200}
                  className="object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-zinc-800 flex items-center justify-center text-xs sm:text-sm text-zinc-500 font-bold uppercase tracking-tight rounded-full mx-auto">
                  {driver.name_acronym}
                </div>
              )}
            </div>

            {/* Pedestal */}
            <div
              className={`relative w-full ${heightClass} flex flex-col items-center justify-start pt-4 rounded-t-xl overflow-hidden`}
              style={{
                background: `linear-gradient(to bottom, ${bgColor}CC, #1a1a1a)`,
                borderTop: `4px solid ${bgColor}`,
              }}
            >
              <span className="absolute top-2 text-5xl sm:text-6xl md:text-8xl font-black text-white/10 italic select-none">
                {driver.position}
              </span>

              <div className="z-20 text-center px-2">
                <p className="text-xs md:text-sm font-bold text-white/60 uppercase">
                  {driver.name_acronym}
                </p>
                <p className="hidden md:block text-xs font-medium text-white/40 truncate">
                  {driver.team_name}
                </p>
                {driver.time && (
                  <p className="text-[10px] text-zinc-400 font-mono mt-1">
                    {driver.time}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
