import { Suspense } from "react";
import Link from "next/link";
import UpcomingSession from "./components/section/UpcomingSession";
import Standings from "./components/section/Standings";
import Results from "./components/section/Results";
import {
  UpcomingSessionSkeleton,
  ResultsSkeleton,
  StandingsSkeleton,
} from "./components/section/Skeletons";

export default function Home() {
  return (
    <div className="flex items-center justify-center font-sans w-full">
      <main className="w-full flex flex-col items-center space-y-5">
        <section
          id="hero"
          className="relative flex w-full flex-col gap-6 items-center justify-center h-screen bg-[#0a0a0a] overflow-hidden"
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                href="/explore"
                className="group relative w-full sm:w-auto px-8 py-4 bg-white text-black font-bold uppercase italic tracking-tighter transition-all hover:bg-red-600 hover:text-white text-center"
              >
                <span className="relative z-10">Get Started</span>
                {/* Small corner accent */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 group-hover:bg-white transition-colors" />
              </Link>

              {/* Small corner accent */}
              {/* <Link
                href="/explore"
                className="group relative w-full sm:w-auto px-8 py-4 bg-zinc-950/80 border border-zinc-800 text-white font-bold uppercase italic tracking-tighter transition-all hover:bg-red-600 hover:border-red-600 text-center"
              >
                <span className="relative z-10">Explore Paddock</span>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 group-hover:bg-white transition-colors" />
              </Link> */}
            </div>
          </div>
        </section>
        <section id="upcoming-session" className="h-auto w-full">
          <Suspense fallback={<UpcomingSessionSkeleton />}>
            <UpcomingSession />
          </Suspense>
        </section>
        <section
          id="last-race-results"
          className="h-auto min-h-[75vh] w-full flex items-center justify-center py-16"
        >
          <Suspense fallback={<ResultsSkeleton />}>
            <Results />
          </Suspense>
        </section>
        <section
          id="drivers-standings"
          className="h-auto min-h-[85vh] w-full flex flex-col gap-4 items-center justify-center py-16"
        >
          <Suspense fallback={<StandingsSkeleton />}>
            <Standings />
          </Suspense>
        </section>
        {/*<section
          id="constructors-standings"
          className="h-[50vh] w-full flex items-center justify-center"
        ></section>*/}
      </main>
    </div>
  );
}
