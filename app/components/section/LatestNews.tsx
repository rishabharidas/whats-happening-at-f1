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
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-4 py-2">
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-red-600" />
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">
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
    </div>
  );
}
