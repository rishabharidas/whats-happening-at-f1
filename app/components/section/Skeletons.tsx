export function UpcomingSessionSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 animate-pulse">
      {/* HEADER SKELETON */}
      <div className="flex items-end justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-red-600/50" />
          <div className="h-8 w-48 bg-zinc-800 rounded-md" />
        </div>
        <div className="h-4 w-40 bg-zinc-800 rounded-md hidden md:block" />
      </div>

      {/* PRIMARY SESSION (Big Card) */}
      <div className="relative overflow-hidden bg-zinc-900/60 border border-zinc-850 rounded-2xl flex flex-col md:flex-row items-stretch min-h-[220px]">
        {/* Left Side Accent Blocks */}
        <div className="bg-zinc-800/40 p-8 flex flex-col items-center justify-center md:w-48 border-b md:border-b-0 md:border-r border-dashed border-zinc-700/50">
          <div className="h-4 w-12 bg-zinc-700/60 rounded mb-2" />
          <div className="h-14 w-16 bg-zinc-700/60 rounded-lg mb-2" />
          <div className="h-4 w-16 bg-zinc-700/60 rounded" />
        </div>

        {/* Center Details */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="h-3 w-24 bg-red-600/30 rounded mb-3" />
          <div className="h-8 w-3/4 bg-zinc-800 rounded-md mb-3" />
          <div className="h-4 w-1/3 bg-zinc-800 rounded" />
        </div>

        {/* Right Side Circuit Outline Skeleton */}
        <div className="md:w-80 border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-950/20 p-6 flex flex-col justify-between min-h-[220px]">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-28 h-28 bg-zinc-800/40 rounded-full" />
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/80">
            <div className="w-6 h-4 bg-zinc-800 rounded" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>

      {/* SECONDARY SESSIONS (Mini Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex items-center gap-4"
          >
            <div className="flex flex-col items-center justify-center border-r border-zinc-800 pr-4 min-w-[60px]">
              <div className="h-3 w-8 bg-zinc-800 rounded mb-1" />
              <div className="h-6 w-8 bg-zinc-800 rounded" />
            </div>
            <div className="flex flex-col flex-1 gap-2">
              <div className="h-3 w-2/3 bg-red-600/30 rounded" />
              <div className="h-4 w-1/2 bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 animate-pulse">
      {/* HEADER SKELETON */}
      <div className="flex items-end justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-red-600/50" />
          <div className="h-8 w-48 bg-zinc-800 rounded-md" />
        </div>
        <div className="h-6 w-32 bg-zinc-800 rounded-full hidden md:block" />
      </div>

      {/* Podium Skeleton */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center pt-2 pb-6">
        {/* Broadcast Header Skeleton */}
        <div className="w-full flex items-center justify-between border-b border-white/5 pb-3 mb-6">
          <div className="h-4 w-48 bg-zinc-800 rounded" />
          <div className="h-4 w-36 bg-zinc-850 rounded hidden sm:block" />
        </div>

        {/* 3 Cards */}
        <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-center gap-3 sm:gap-4 md:gap-4 lg:gap-6 pb-4 sm:pb-6">
          {/* P1 (order-1 on mobile, order-2 on desktop) */}
          <div className="w-full max-w-[330px] sm:max-w-[360px] md:max-w-[340px] lg:max-w-[360px] flex flex-col items-center order-1 md:order-2 md:-translate-y-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-56 md:h-56 bg-zinc-800/50 rounded-full -mb-3 sm:-mb-4 md:-mb-6" />
            <div className="w-full rounded-2xl md:rounded-3xl border border-amber-500/50 bg-zinc-900/90 p-4 sm:p-5 flex flex-col justify-between shadow-[0_0_25px_rgba(245,158,11,0.15)] md:min-h-[190px]">
              <div className="h-4 w-16 bg-amber-500/40 rounded" />
              <div className="space-y-1.5 py-2">
                <div className="h-2.5 w-14 bg-zinc-800 rounded" />
                <div className="h-5 sm:h-6 w-32 bg-zinc-800 rounded" />
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2">
                <div className="h-3.5 w-16 bg-zinc-800 rounded" />
                <div className="h-3.5 w-8 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>

          {/* P2 (order-2 on mobile, order-1 on desktop) */}
          <div className="w-full max-w-[330px] sm:max-w-[360px] md:max-w-[290px] lg:max-w-[310px] flex flex-col items-center order-2 md:order-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-44 md:h-44 bg-zinc-800/40 rounded-full -mb-3 sm:-mb-4 md:-mb-6" />
            <div className="w-full rounded-2xl md:rounded-3xl border border-zinc-700/50 bg-zinc-900/80 p-4 sm:p-5 flex flex-col justify-between md:min-h-[190px]">
              <div className="h-4 w-14 bg-zinc-700 rounded" />
              <div className="space-y-1.5 py-2">
                <div className="h-2.5 w-14 bg-zinc-800 rounded" />
                <div className="h-5 sm:h-6 w-28 bg-zinc-800 rounded" />
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2">
                <div className="h-3.5 w-14 bg-zinc-800 rounded" />
                <div className="h-3.5 w-8 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>

          {/* P3 (order-3 on mobile, order-3 on desktop) */}
          <div className="w-full max-w-[330px] sm:max-w-[360px] md:max-w-[290px] lg:max-w-[310px] flex flex-col items-center order-3 md:order-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-44 md:h-44 bg-zinc-800/40 rounded-full -mb-3 sm:-mb-4 md:-mb-6" />
            <div className="w-full rounded-2xl md:rounded-3xl border border-amber-800/40 bg-zinc-900/80 p-4 sm:p-5 flex flex-col justify-between md:min-h-[190px]">
              <div className="h-4 w-14 bg-amber-800/40 rounded" />
              <div className="space-y-1.5 py-2">
                <div className="h-2.5 w-14 bg-zinc-800 rounded" />
                <div className="h-5 sm:h-6 w-28 bg-zinc-800 rounded" />
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2">
                <div className="h-3.5 w-14 bg-zinc-800 rounded" />
                <div className="h-3.5 w-8 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Championship Bar Skeleton */}
        <div className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-zinc-900/80 border border-zinc-800 mt-1 sm:mt-2" />
      </div>
    </div>
  );
}

export function StandingsSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-6 animate-pulse">
      {/* Title */}
      <div className="flex justify-center md:justify-start mb-6">
        <div className="h-12 w-80 bg-zinc-800 rounded-lg" />
      </div>

      {/* Tabs & Search controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        {/* Mock Tabs */}
        <div className="flex bg-zinc-950/80 p-1 rounded-full border border-zinc-800 w-full md:w-72">
          <div className="flex-1 h-8 bg-zinc-800 rounded-full" />
          <div className="flex-1 h-8 bg-transparent rounded-full" />
        </div>
        {/* Mock Search Bar */}
        <div className="w-full md:w-80 h-10 bg-zinc-900/60 border border-zinc-800 rounded-full" />
      </div>

      {/* Standings List Container */}
      <div className="relative bg-zinc-950/20 border border-zinc-900 rounded-2xl p-4 md:p-6">
        {/* Header label */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800/40 mb-3">
          <div className="w-12 h-3 bg-zinc-800 rounded" />
          <div className="flex-1 ml-4 h-3 w-32 bg-zinc-800 rounded" />
          <div className="hidden md:block w-48 pl-4 h-3 bg-zinc-800 rounded" />
          <div className="w-16 h-3 bg-zinc-800 rounded" />
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2.5 max-h-[550px] overflow-hidden">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="flex items-center bg-zinc-900/40 border border-zinc-800/60 py-2.5 pl-3 pr-6 rounded-r-lg"
              style={{ borderLeft: "4px solid #333" }}
            >
              {/* Position */}
              <div className="w-12 flex justify-center">
                <div className="h-6 w-6 bg-zinc-800 rounded-full" />
              </div>

              {/* Photo & Info */}
              <div className="flex-1 ml-4 flex items-center">
                <div className="w-14 h-14 bg-zinc-800/80 rounded-full border border-zinc-700/60" />
                <div className="flex flex-col ml-4 gap-2">
                  <div className="h-4 w-40 bg-zinc-850 rounded" />
                  <div className="h-3 w-24 bg-zinc-850 rounded md:hidden" />
                </div>
              </div>

              {/* Team Name */}
              <div className="hidden md:block w-48 pl-4">
                <div className="h-4 w-32 bg-zinc-850 rounded" />
              </div>

              {/* Points */}
              <div className="w-16 flex justify-end">
                <div className="h-5 w-8 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LatestNewsSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-2 animate-pulse">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-zinc-800" />
          <div className="h-8 w-44 bg-zinc-800 rounded" />
        </div>
        <div className="h-8 w-28 bg-zinc-850 rounded-full" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden min-h-[380px]"
          >
            <div className="h-44 w-full bg-zinc-950" />
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="h-3 w-28 bg-zinc-850 rounded" />
                <div className="h-4 w-full bg-zinc-800 rounded mt-1" />
                <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                <div className="h-3 w-full bg-zinc-850 rounded mt-2" />
                <div className="h-3 w-5/6 bg-zinc-850 rounded" />
              </div>
              <div className="h-4 w-1/4 bg-zinc-800 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LiveTrackStatusSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-2 animate-pulse font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-red-600/50" />
            <div className="h-8 w-44 bg-zinc-800 rounded" />
            <div className="h-6 w-28 bg-zinc-800 rounded-full" />
          </div>
          <div className="h-3 w-64 bg-zinc-800/60 rounded mt-2" />
        </div>
        <div className="h-7 w-32 bg-zinc-800 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 min-h-[260px] flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="h-3 w-32 bg-red-600/30 rounded" />
            <div className="h-8 w-2/3 bg-zinc-800 rounded" />
            <div className="h-5 w-1/3 bg-zinc-800/60 rounded" />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-8 pt-6 border-t border-zinc-800/80 max-w-md">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-zinc-800/40 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 min-h-[260px] flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="h-3 w-28 bg-zinc-800 rounded" />
            <div className="h-6 w-3/4 bg-zinc-800 rounded" />
            <div className="h-4 w-1/2 bg-zinc-800/60 rounded" />
          </div>
          <div className="h-10 bg-zinc-800/40 rounded-lg mt-6" />
        </div>
      </div>
    </div>
  );
}
