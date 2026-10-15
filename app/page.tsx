import { Suspense } from "react";
import { getLiveStatus } from "@/utils/liveStatus";
import HeroSection from "./components/section/HeroSection";
import LiveTrackStatus from "./components/section/LiveTrackStatus";
import Standings from "./components/section/Standings";
import Results from "./components/section/Results";
import LatestNews from "./components/section/LatestNews";
import ExploreGateway from "./components/section/ExploreGateway";
import {
  LiveTrackStatusSkeleton,
  ResultsSkeleton,
  StandingsSkeleton,
  LatestNewsSkeleton,
} from "./components/section/Skeletons";

export const dynamic = "force-dynamic";

export default async function Home() {
  let statusData = null;
  try {
    statusData = await getLiveStatus();
  } catch (error) {
    console.error("Failed to fetch initial status data for Hero:", error);
  }

  return (
    <div className="flex flex-col items-center justify-center font-sans w-full max-w-full overflow-x-hidden bg-[#0a0a0a] text-zinc-100 min-h-screen">
      <main className="w-full max-w-full overflow-x-hidden flex flex-col items-center">
        {/* 1. MOTORSPORT IDENTITY & DYNAMIC HERO */}
        <HeroSection statusData={statusData} />

        {/* 2. EVENT-AWARE RACE CENTER & TRACK STATUS */}
        <section
          id="race-center-section"
          className="w-full py-12 border-t border-zinc-900/60 bg-zinc-950/40"
        >
          <Suspense fallback={<LiveTrackStatusSkeleton />}>
            <LiveTrackStatus />
          </Suspense>
        </section>

        {/* 3. LATEST GRAND PRIX 3D PODIUM & RESULTS */}
        <section
          id="last-race-results"
          className="w-full py-16 border-t border-zinc-900/60"
        >
          <Suspense fallback={<ResultsSkeleton />}>
            <Results />
          </Suspense>
        </section>

        {/* 4. WORLD CHAMPIONSHIP STANDINGS */}
        <section
          id="drivers-standings"
          className="w-full py-16 bg-zinc-950/30 border-t border-zinc-900/60"
        >
          <Suspense fallback={<StandingsSkeleton />}>
            <Standings />
          </Suspense>
        </section>

        {/* 5. PADDOCK NEWS & WIRE */}
        <section
          id="paddock-news"
          className="w-full py-16 border-t border-zinc-900/60"
        >
          <Suspense fallback={<LatestNewsSkeleton />}>
            <LatestNews />
          </Suspense>
        </section>

        {/* 6. EXPLORE THE PADDOCK FEATURE GATEWAY */}
        <section
          id="explore-gateway"
          className="w-full py-14 bg-zinc-950/40 border-t border-zinc-900/60"
        >
          <ExploreGateway />
        </section>
      </main>
    </div>
  );
}
