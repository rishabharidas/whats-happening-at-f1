import api from "@/utils/api";
import { Driver } from "@/types/drivers";
import Image from "next/image";

export default async function Standings({ drivers }: { drivers: Driver[] }) {
  const { get } = api();

  const response = await get("championship_drivers?session_key=latest");
  const standingsData = await response.json();

  const driversMap = drivers.reduce(
    (acc, driver) => {
      acc[driver.driver_number] = driver;
      return acc;
    },
    {} as Record<string, (typeof drivers)[0]>,
  );

  const standings = standingsData.map(
    (driver: Driver & { points_current: string }) => ({
      ...driver,
      ...driversMap[driver.driver_number],
    }),
  );

  return (
    <>
      <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter underline underline-offset-8 mb-12">
        Drivers <span className="text-zinc-700">Standings</span>
      </h2>
      <div className="w-full max-w-5xl mx-auto px-4 py-8 h-full overflow-y-auto">
        <div className="flex flex-col w-full gap-3">
          {/* Header Row */}
          <div className="flex items-center px-6 py-2 text-xs font-bold uppercase text-zinc-500 tracking-widest">
            <span className="w-12">Pos</span>
            <span className="flex-1 ml-4">Driver</span>
            <span className="hidden md:block w-48">Constructor</span>
            <span className="w-16 text-right">PTS</span>
          </div>

          {standings.map(
            (driver: Driver & { points_current: string }, index: number) => (
              <div
                key={index}
                className="group flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-2 pr-6 rounded-r-lg transition-colors hover:bg-zinc-800"
                style={{
                  borderLeft: `4px solid #${driver.team_colour || "333"}`,
                }}
              >
                {/* Position & Photo */}
                <div className="flex items-center w-auto md:min-w-80">
                  <span className="w-12 text-center font-black italic text-xl text-zinc-600 group-hover:text-white transition-colors">
                    {index + 1}
                  </span>
                  <div className="relative w-14 h-14 overflow-hidden bg-zinc-800 rounded-full border border-zinc-700 ml-2">
                    <Image
                      src={driver.headshot_url}
                      alt={driver.full_name}
                      fill
                      sizes="(max-width: 768px) 14vw, 140px"
                      className="object-cover object-top scale-110"
                    />
                  </div>

                  {/* Driver Info */}
                  <div className="flex flex-col ml-4">
                    <span className="font-bold text-white uppercase tracking-tight">
                      {driver.full_name}
                      <span className="ml-2 text-xs text-zinc-500 font-mono">
                        #{driver.driver_number}
                      </span>
                    </span>
                    <span className="md:hidden text-[10px] text-zinc-500 uppercase font-bold text-start">
                      {driver.team_name}
                    </span>
                  </div>
                </div>

                {/* Desktop Team Name */}
                <span className="hidden md:block w-48 text-sm font-medium text-zinc-400 uppercase tracking-tighter">
                  {driver.team_name}
                </span>

                {/* Points */}
                <div className="w-16 text-right">
                  <span className="font-black text-lg text-white tabular-nums">
                    {driver.points_current}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
}
