// import Image from "next/image";

import Link from "next/link";
import dynamic from "next/dynamic";
import api from "@/utils/api";

const UpcomingSession = dynamic(
  () => import("./components/section/UpcomingSession"),
);
const Standings = dynamic(() => import("./components/section/Standings"));
const Results = dynamic(() => import("./components/section/Results"));

export default async function Home() {
  const { get } = api();
  const currentYear = new Date().getFullYear();

  const res = await get(`sessions?is_cancelled=false&year=${currentYear}`);
  const currentYearSessions = await res.json();

  const driversResposne = await get("drivers");
  const drivers = await driversResposne.json();

  return (
    <div className="flex items-center justify-center font-sans w-full">
      <main className="w-full flex flex-col items-center space-y-5">
        <section
          id="hero"
          className="relative flex w-full flex-col gap-6 items-center justify-center h-[90vh] bg-[#0a0a0a] overflow-hidden"
        >
          {/* Decorative "Speed" background element */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-75 bg-red-600 blur-[120px] rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-4xl md:text-8xl font-black text-white italic uppercase tracking-tighter text-center leading-[0.9]">
              What's <br />
              <span className="text-red-600">Happening</span>
              <span className="text-white">@F1</span>
            </h1>

            <p className="mt-6 text-zinc-400 font-medium tracking-widest uppercase text-xs md:text-sm">
              F1 News • Standings • Race Analysis
            </p>

            <Link
              href="#last-race-results"
              className="group mt-10 relative px-8 py-4 bg-white text-black font-bold uppercase italic tracking-tighter transition-all hover:bg-red-600 hover:text-white"
            >
              <span className="relative z-10">Get Started</span>
              {/* Small corner accent */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 group-hover:bg-white transition-colors" />
            </Link>
          </div>
        </section>
        <section
          id="last-race-results"
          className="h-[90vh] w-full flex items-center justify-center py-16"
        >
          <Results drivers={drivers} />
        </section>
        <section
          id="drivers-standings"
          className="h-[90vh] w-full flex flex-col gap-4 items-center justify-center py-16"
        >
          <Standings drivers={drivers} />
        </section>
        <section id="upcoming-session" className="h-[50vh] w-full">
          <UpcomingSession sessions={currentYearSessions} />
        </section>
        <section
          id="constructors-standings"
          className="h-[50vh] w-full flex items-center justify-center"
        ></section>
      </main>
    </div>
  );
}
