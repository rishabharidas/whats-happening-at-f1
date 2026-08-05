import React from "react";
import newsApi from "@/utils/newsApi";

export default async function ExploreNewsGrid() {
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
      process.stdout.write(
        "Error fetching news in ExploreNewsGrid: " +
          (error?.message || error) +
          "\n",
      );
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
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
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
              src={
                featured.urlToImage ||
                "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800"
              }
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
                  src={
                    article.urlToImage ||
                    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800"
                  }
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
