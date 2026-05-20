import React, { Suspense } from "react";
import Link from "next/link";
import newsApi from "@/utils/newsApi";
import { NewsGridSkeleton } from "@/components/news/NewsSkeletons";
import NewsExplorerClient from "@/components/news/NewsExplorerClient";

// Force dynamic execution for local developer convenience
export const dynamic = "force-dynamic";

// Inner Server Component that fetches a larger set of F1 news
async function exploreNewsLoader() {
  const { getF1News } = newsApi();
  let articles: any[] = [];

  try {
    const res = await getF1News(24);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.articles)) {
        articles = data.articles;
      }
    }
  } catch (error: any) {
    if (typeof process !== "undefined" && process.stdout) {
      process.stdout.write("Error fetching full news feed: " + (error?.message || error) + "\n");
    }
  }

  // Fallback if completely empty
  if (articles.length === 0) {
    return (
      <div className="py-24 text-center border border-dashed border-zinc-800 rounded-3xl w-full">
        <p className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
          No articles could be retrieved from the paddock server feed.
        </p>
      </div>
    );
  }

  return <NewsExplorerClient initialArticles={articles} />;
}

export default function ExploreNews() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans w-full py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        {/* NAV HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/explore"
              className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              &larr; Back to Explore
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter">
            PADDOCK <span className="text-red-600">NEWS BROWSER</span>
          </h1>
        </div>

        {/* FEED EXPLORER SECTION WRAPPED IN SUSPENSE */}
        <div className="w-full">
          <Suspense fallback={<NewsGridSkeleton count={6} />}>
            {exploreNewsLoader()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
