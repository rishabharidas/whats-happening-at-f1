"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Article {
  source: { name: string };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
}

export default function NewsExplorerClient({
  initialArticles,
}: {
  initialArticles: Article[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSource, setActiveSource] = useState("All");

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Paddock Insider";
    }
  };

  // Extract unique sources for filter pills
  const sourcesList = useMemo(() => {
    const names = new Set<string>();
    initialArticles.forEach((a) => {
      if (a.source?.name) names.add(a.source.name);
    });
    return ["All", ...Array.from(names)];
  }, [initialArticles]);

  // Dynamic filter based on search query and selected source
  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const matchesSource =
        activeSource === "All" || article.source?.name === activeSource;
      const matchesSearch =
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        article.source?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        article.author?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSource && matchesSearch;
    });
  }, [initialArticles, searchQuery, activeSource]);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* FILTER & SEARCH CONTROL BOX */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-800 pb-8 mt-2">
        {/* Source filtering pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {sourcesList.slice(0, 6).map((source) => {
            const isActive = activeSource === source;
            return (
              <button
                key={source}
                onClick={() => setActiveSource(source)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                {source}
              </button>
            );
          })}
        </div>

        {/* Live Search bar */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search explore news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 text-white rounded-full pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors focus:ring-1 focus:ring-red-500/20 font-sans"
          />
          {/* Magnifying glass icon */}
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs font-bold font-sans cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ARTICLES GRID */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {filteredArticles.map((article, idx) => (
            <div
              key={idx}
              className="group flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden min-h-[440px] transition-all hover:border-zinc-700"
            >
              {/* Image Frame */}
              <div className="h-48 w-full bg-zinc-950 relative overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    article.urlToImage ||
                    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800"
                  }
                  alt={article.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  onError={(e: any) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              </div>

              {/* Card Contents */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-zinc-850 text-zinc-400 rounded tracking-wider">
                      {article.source?.name || "F1 Paddock"}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>

                  <h3 className="font-bold text-white uppercase tracking-tight line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-zinc-400 font-medium text-xs mt-2 line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/40 mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">
                    By {article.author || "Paddock Press"}
                  </span>
                  <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-red-500 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Read Story &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-dashed border-zinc-800 rounded-3xl w-full">
          <svg
            className="w-12 h-12 text-zinc-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
            No matching F1 explore articles found
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveSource("All");
            }}
            className="mt-4 px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
