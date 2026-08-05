export default function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* Filter pills skeleton */}
      <div className="flex items-center gap-3 mb-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-7 w-24 rounded-full bg-zinc-800" />
        ))}
      </div>
      {/* Race card skeletons */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-zinc-800/50 bg-zinc-900/20 overflow-hidden">
          <div className="flex items-stretch">
            <div className="flex flex-col items-center justify-center px-5 py-5 min-w-[80px] border-r border-zinc-800/30 bg-zinc-900/20 gap-2">
              <div className="h-3 w-8 bg-zinc-800 rounded" />
              <div className="h-8 w-10 bg-zinc-800 rounded" />
              <div className="h-3 w-8 bg-zinc-800 rounded" />
            </div>
            <div className="flex-1 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-5 w-3/5 bg-zinc-800 rounded" />
                <div className="h-3 w-2/5 bg-zinc-800/60 rounded" />
              </div>
              <div className="h-10 w-28 bg-zinc-800 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
