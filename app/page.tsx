import { getLiveStatus } from "@/utils/liveStatus";
import newsApi from "@/utils/newsApi";
import HomeViewManager from "./components/HomeViewManager";

export const dynamic = "force-dynamic";

export default async function Home() {
  let statusData = null;
  try {
    statusData = await getLiveStatus();
  } catch (error) {
    console.error("Failed to fetch initial status data for Hero:", error);
  }

  let newsArticles: Array<{
    title: string;
    url?: string;
    publishedAt?: string;
    source?: { name?: string };
  }> = [];
  try {
    const res = await newsApi().getF1News(3);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.articles)) {
        newsArticles = data.articles.slice(0, 3);
      }
    }
  } catch {
    // silent fallback
  }

  return (
    <div className="flex flex-col items-center justify-center font-sans w-full max-w-full overflow-x-hidden bg-[#0a0a0a] text-zinc-100 min-h-screen">
      <main className="w-full max-w-full overflow-x-hidden flex flex-col items-center">
        <HomeViewManager statusData={statusData} newsArticles={newsArticles} />
      </main>
    </div>
  );
}
