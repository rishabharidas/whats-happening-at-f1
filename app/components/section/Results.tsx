import api from "@/utils/api";
import Image from "next/image";

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
  "cadillac f1 team": "FFD700"
};

export default async function Results() {
  const { get } = api();

  const results_response = await get("current/last/results.json");
  const data = await results_response.json();

  const race = data?.MRData?.RaceTable?.Races?.[0];
  if (!race) {
    return null;
  }

  const sessionName = race.raceName;
  const results = race.Results || [];

  if (results.length === 0) {
    return null;
  }

  // Get podium (top 3)
  const podiumResults = results.slice(0, 3);
  
  // Fetch headshots from OpenF1 (fast static endpoint)
  let driverImages: Record<number, string> = {};
  try {
    const openF1Res = await fetch("https://api.openf1.org/v1/drivers?session_key=latest");
    const openF1Data = await openF1Res.json();
    if (Array.isArray(openF1Data)) {
      openF1Data.forEach((d: any) => {
        driverImages[d.driver_number] = d.headshot_url;
      });
    }
  } catch (e) {
    console.error("Failed to fetch driver images from OpenF1", e);
  }

  const resultData = podiumResults.map((result: any) => {
    const driver = result.Driver;
    const constructor = result.Constructor;
    const teamName = constructor?.name || "";

    return {
      position: parseInt(result.position),
      name_acronym: driver.code,
      full_name: `${driver.givenName} ${driver.familyName}`,
      team_name: teamName,
      team_colour: TEAM_COLORS[teamName.toLowerCase()] || "333333",
      headshot_url: (driverImages[parseInt(result.number)] || "").replace(
        "1col",
        "4col"
      ),
    };
  });

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [resultData[1], resultData[0], resultData[2]].filter(
    Boolean,
  );

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

      <div className="flex items-end justify-center w-full max-w-4xl gap-2 md:gap-6 h-100">
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
              key={index}
              className="relative flex flex-col items-center flex-1 max-w-50"
            >
              <div
                className={`relative z-10 transition-transform duration-500 hover:scale-105 ${isWinner ? "w-32 md:w-44" : "w-24 md:w-32"}`}
              >
                {isWinner && (
                  <div className="absolute inset-0 bg-white/20 blur-[60px] rounded-full animate-pulse" />
                )}
                {driver?.headshot_url ? (
                  <Image
                    src={driver.headshot_url}
                    alt={driver.full_name || "Driver"}
                    width={200}
                    height={200}
                    className="object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-800 flex items-center justify-center text-sm text-zinc-500 font-bold uppercase tracking-tight rounded-full mx-auto">
                    F1
                  </div>
                )}
              </div>

              <div
                className={`relative w-full ${heightClass} flex flex-col items-center justify-start pt-4 rounded-t-xl overflow-hidden`}
                style={{
                  background: `linear-gradient(to bottom, ${bgColor}CC, #1a1a1a)`,
                  borderTop: `4px solid ${bgColor}`,
                }}
              >
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
