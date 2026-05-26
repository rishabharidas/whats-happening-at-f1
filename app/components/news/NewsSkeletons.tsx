export function FeaturedNewsSkeleton() {
  return (
    <div className="w-full relative group overflow-hidden bg-zinc-900/60 border border-zinc-850 rounded-3xl flex flex-col lg:flex-row items-stretch min-h-[400px] animate-pulse">
      {/* Visual Image Block */}
      <div className="lg:w-[55%] min-h-[250px] lg:min-h-[400px] bg-zinc-800/40 relative flex-shrink-0" />

      {/* Content Text Block */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-24 bg-red-600/30 rounded-full" />
            <div className="h-4 w-32 bg-zinc-800 rounded" />
          </div>
          <div className="h-10 w-[90%] bg-zinc-800 rounded-lg mt-2" />
          <div className="h-10 w-[70%] bg-zinc-800 rounded-lg" />
          <div className="h-5 w-[95%] bg-zinc-800/60 rounded mt-4" />
          <div className="h-5 w-[85%] bg-zinc-800/60 rounded" />
        </div>
        <div className="h-10 w-36 bg-zinc-800 rounded-full mt-6" />
      </div>
    </div>
  );
}

export function NewsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col bg-zinc-900/40 border border-zinc-850 rounded-2xl overflow-hidden min-h-[420px]"
        >
          {/* Card Image */}
          <div className="h-48 w-full bg-zinc-800/40" />

          {/* Body Content */}
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-16 bg-red-600/30 rounded-full" />
                <div className="h-3 w-20 bg-zinc-800 rounded" />
              </div>
              <div className="h-6 w-full bg-zinc-800 rounded-md mt-1" />
              <div className="h-6 w-[80%] bg-zinc-800 rounded-md" />
              <div className="h-4 w-[95%] bg-zinc-800/60 rounded mt-2" />
              <div className="h-4 w-[85%] bg-zinc-800/60 rounded" />
            </div>

            {/* Footer */}
            <div className="h-4 w-28 bg-zinc-850 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
