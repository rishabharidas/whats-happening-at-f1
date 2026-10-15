import Link from "next/link";
import newsApi from "@/utils/newsApi";

export default async function LatestNews() {
  const { getF1News } = newsApi();
  let articles: any[] = [];

  try {
    const res = await getF1News(3);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.articles)) {
        articles = data.articles.slice(0, 3);
      }
    }
  } catch (error) {
    // silent
  }

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

  if (articles.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-2">
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 bg-red-600 rounded-full" />
          <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tighter">
            Paddock <span className="text-red-600">News</span>
          </h2>
        </div>
        <Link
          href="/explore/news"
          className="group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase italic tracking-widest bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-red-600 hover:text-white transition-all rounded-full"
        >
          <span>More News</span>
          <svg
            className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>

      {/* ARTICLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
        {articles.map((article, idx) => (
          <div
            key={idx}
            className="group flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden min-h-[380px] transition-all hover:border-zinc-700"
          >
            {/* Image Frame */}
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

            {/* Card Contents */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-zinc-850 text-zinc-400 rounded tracking-wider">
                    {article.source?.name || "F1 Paddock"}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">
                    {formatDate(article.publishedAt)}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white uppercase tracking-tight line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
                  {article.title}
                </h3>

                <p className="text-zinc-400 font-medium text-xs line-clamp-3 leading-relaxed mt-1">
                  {article.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/40 mt-3 flex items-center justify-between">
                <span className="text-[9px] text-zinc-500 font-mono truncate max-w-[120px]">
                  By {article.author || "Paddock Press"}
                </span>
                <Link
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Read &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EXPLORE HUB DISCOVERY STRIP */}
      <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-red-950/30 border border-zinc-800 hover:border-red-600/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-black italic uppercase tracking-tight text-white">
              Hungry for more motorsport culture?
            </h4>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Listen to unfiltered team radios, browse the technical lexicon, and explore Hall of Fame legends.
            </p>
          </div>
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/20 flex-shrink-0"
        >
          <span>Explore The Paddock</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
