import React, { Suspense } from "react";
import Link from "next/link";
import {
  FeaturedNewsSkeleton,
  NewsGridSkeleton,
} from "@/components/news/NewsSkeletons";
import ExploreNewsGrid from "@/components/explore/ExploreNewsGrid";
import SidebarFastFacts from "@/components/explore/SidebarFastFacts";
import PaddockAudioCenter from "@/components/explore/PaddockAudioCenter";
import TechLexicon from "@/components/explore/TechLexicon";
import HallOfFame from "@/components/explore/HallOfFame";

// Force dynamic so it always evaluates freshly in development
export const dynamic = "force-dynamic";

export default function Explore() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans w-full py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        {/* NAV HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              &larr; Back to Home
            </Link>
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter">
            EXPLORE THE <span className="text-red-600">PADDOCK</span>
          </h2>
        </div>

        {/* MAIN SPLIT GRID: News (Left) & Sidebar Facts (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start w-full">
          {/* NEWS STREAM FEED (LEFT COLUMN) */}
          <div className="lg:col-span-3 flex flex-col gap-8 items-center w-full">
            <Suspense
              fallback={
                <div className="w-full flex flex-col gap-8">
                  <FeaturedNewsSkeleton />
                  <NewsGridSkeleton count={3} />
                </div>
              }
            >
              <ExploreNewsGrid />
            </Suspense>

            {/* Load More Button */}
            <div className="mt-8 mb-4">
              <Link
                href="/explore/news"
                className="group relative inline-flex px-8 py-4 bg-zinc-950/80 border border-zinc-800 text-white font-bold uppercase italic tracking-wider transition-all hover:bg-red-600 hover:border-red-600"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Browse More F1 News
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-600 group-hover:bg-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* SIDEBAR FAST FACTS (RIGHT COLUMN) */}
          <SidebarFastFacts />
        </div>

        {/* PADDOCK AUDIO CENTER */}
        <PaddockAudioCenter />

        {/* INTERACTIVE LEXICON & GLOSSARY */}
        <TechLexicon isPreview={true} />

        {/* HALL OF FAME LEGENDS */}
        <HallOfFame />
      </div>
    </div>
  );
}
