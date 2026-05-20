import React, { Suspense } from "react";
import Link from "next/link";
import newsApi from "@/utils/newsApi";
import { FeaturedNewsSkeleton, NewsGridSkeleton } from "@/components/news/NewsSkeletons";

// Force dynamic so it always evaluates freshly in development
export const dynamic = "force-dynamic";

// Fast Facts data for visual excellence
const PADDOCK_FAST_FACTS = [
  {
    number: "7",
    title: "World Championships",
    holder: "Lewis Hamilton & Michael Schumacher",
    desc: "The absolute record for the most driver championship titles in Formula 1 history.",
    color: "from-red-600 to-orange-500"
  },
  {
    number: "105",
    title: "Grand Prix Wins",
    holder: "Lewis Hamilton",
    desc: "The record holder for the highest number of individual race victories.",
    color: "from-blue-600 to-indigo-500"
  },
  {
    number: "18y",
    title: "Youngest Race Winner",
    holder: "Max Verstappen (GP Spain 2016)",
    desc: "Stunned the motorsport world by winning on his Red Bull debut at just 18 years, 228 days.",
    color: "from-yellow-500 to-amber-600"
  },
  {
    number: "1:18.8",
    title: "Fastest Ever Lap (Monza)",
    holder: "Lewis Hamilton (2020)",
    desc: "Recorded at an average speed of 264.362 km/h (164.267 mph) during qualifying.",
    color: "from-emerald-500 to-teal-600"
  }
];

// Inner Server Component that fetches the news
async function ExploreNewsGrid() {
  const { getF1News } = newsApi();
  let articles: any[] = [];
  
  try {
    const res = await getF1News(4);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.articles)) {
        articles = data.articles;
      }
    }
  } catch (error: any) {
    if (typeof process !== "undefined" && process.stdout) {
      process.stdout.write("Error fetching news in ExploreNewsGrid: " + (error?.message || error) + "\n");
    }
  }

  // Fallback to empty checks
  if (articles.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500 uppercase font-mono text-sm tracking-wider border border-dashed border-zinc-800 rounded-2xl w-full">
        No recent F1 articles found in the paddock feed
      </div>
    );
  }

  const featured = articles[0];
  const secondary = articles.slice(1, 4);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Paddock Insider";
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* FEATURED STORY CARD */}
      {featured && (
        <div className="w-full relative group overflow-hidden bg-zinc-900/40 border border-zinc-800 rounded-3xl flex flex-col lg:flex-row items-stretch transition-all duration-300 hover:border-zinc-700">
          {/* Cover image */}
          <div className="lg:w-[55%] min-h-[250px] lg:min-h-[400px] bg-zinc-950 relative overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.urlToImage || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800"}
              alt={featured.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
            {/* Dark gradient overlap */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
          </div>

          {/* Info body */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-between relative">
            <div className="absolute right-4 top-4 text-7xl font-black text-white/3 italic pointer-events-none uppercase">
              TOP STORY
            </div>

            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-[10px] font-black uppercase bg-red-600 text-white rounded-full tracking-wider">
                  {featured.source?.name || "Paddock Feed"}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {formatDate(featured.publishedAt)}
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white tracking-tighter leading-tight group-hover:text-red-500 transition-colors mt-2">
                {featured.title}
              </h3>

              <p className="text-zinc-400 font-medium text-sm mt-4 leading-relaxed line-clamp-3">
                {featured.description}
              </p>
            </div>

            <div className="mt-8 z-10">
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-white text-black font-bold uppercase italic text-xs tracking-wider transition-all rounded-md hover:bg-red-600 hover:text-white"
              >
                Read Full Story
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SECONDARY MINI GRID */}
      {secondary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-2">
          {secondary.map((article: any, idx: number) => (
            <div
              key={idx}
              className="group flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden min-h-[420px] transition-all hover:border-zinc-700"
            >
              {/* Thumbnail Image */}
              <div className="h-44 w-full bg-zinc-950 relative overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.urlToImage || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800"}
                  alt={article.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Text Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-zinc-800 text-zinc-300 rounded tracking-wider">
                      {article.source?.name || "F1 News"}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>

                  <h4 className="font-bold text-white uppercase tracking-tight line-clamp-2 group-hover:text-red-500 transition-colors">
                    {article.title}
                  </h4>

                  <p className="text-zinc-400 font-medium text-xs mt-2 line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/40 mt-4 flex items-center justify-between">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-red-500 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Read More &rarr;
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
              &larr; Back to Standings
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
            <Suspense fallback={
              <div className="w-full flex flex-col gap-8">
                <FeaturedNewsSkeleton />
                <NewsGridSkeleton count={3} />
              </div>
            }>
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
          <div className="lg:col-span-1 flex flex-col gap-6 w-full lg:sticky lg:top-8">
            <div className="border border-zinc-800 bg-zinc-950/60 p-6 rounded-2xl relative overflow-hidden flex flex-col gap-4">
              {/* Background ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />

              <h3 className="text-lg font-black italic uppercase text-white tracking-tight flex items-center gap-2 border-b border-zinc-800 pb-3">
                <span className="h-4 w-1 bg-red-600" />
                Paddock Fast Facts
              </h3>

              <div className="flex flex-col gap-4">
                {PADDOCK_FAST_FACTS.map((fact, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl relative group overflow-hidden transition-all hover:border-zinc-800"
                  >
                    <span
                      className={`text-3xl font-black italic tracking-tighter bg-gradient-to-r ${fact.color} bg-clip-text text-transparent`}
                    >
                      {fact.number}
                    </span>
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-tight mt-1">
                      {fact.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5 italic">
                      {fact.holder}
                    </span>
                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      {fact.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}