import { Suspense } from "react";
import Link from "next/link";
import UpcomingSession from "./components/section/UpcomingSession";
import Standings from "./components/section/Standings";
import Results from "./components/section/Results";
import LatestNews from "./components/section/LatestNews";
import {
  UpcomingSessionSkeleton,
  ResultsSkeleton,
  StandingsSkeleton,
  LatestNewsSkeleton,
} from "./components/section/Skeletons";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center font-sans w-full bg-[#0a0a0a]">
      <main className="w-full flex flex-col items-center">
        <section
          id="hero"
          className="relative flex w-full flex-col gap-6 items-center justify-center min-h-screen bg-[#0a0a0a] overflow-hidden"
        >
          {/* Decorative "Speed" background element */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-75 bg-red-600 blur-[120px] rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-4xl md:text-8xl font-black text-white italic uppercase tracking-tighter text-center leading-[0.9]">
              {"What's"} <br />
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
            </div>
          </div>
        </section>

        <section id="upcoming-session" className="w-full py-16 border-t border-zinc-900/30">
          <Suspense fallback={<UpcomingSessionSkeleton />}>
            <UpcomingSession />
          </Suspense>
        </section>

        <section id="paddock-news" className="w-full py-16 bg-zinc-950/20 border-t border-zinc-900/30">
          <Suspense fallback={<LatestNewsSkeleton />}>
            <LatestNews />
          </Suspense>
        </section>

        <section id="last-race-results" className="w-full py-16 border-t border-zinc-900/30">
          <Suspense fallback={<ResultsSkeleton />}>
            <Results />
          </Suspense>
        </section>

        <section id="drivers-standings" className="w-full py-16 bg-zinc-950/20 border-t border-zinc-900/30">
          <Suspense fallback={<StandingsSkeleton />}>
            <Standings />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
