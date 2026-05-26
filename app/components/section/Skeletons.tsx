export function UpcomingSessionSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-4 py-10 animate-pulse">
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
    <div className="py-16 px-4 flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden w-full animate-pulse">
      <div className="text-center mb-12 flex flex-col items-center gap-2">
        <div className="h-4 w-32 bg-blue-500/30 rounded" />
        <div className="h-10 w-64 bg-zinc-800 rounded-md" />
      </div>

      {/* Podium Skeleton */}
      <div className="flex items-end justify-center w-full max-w-4xl gap-2 md:gap-6 h-100">
        {/* P2 - Second Podium */}
        <div className="flex flex-col items-center flex-1 max-w-50">
          <div className="w-24 md:w-32 h-24 md:h-32 bg-zinc-800/40 rounded-full mb-4" />
          <div className="w-full h-48 bg-zinc-900/60 rounded-t-xl border-t-4 border-zinc-800 flex flex-col items-center pt-4">
            <div className="h-10 w-12 bg-zinc-800/30 rounded mb-3" />
            <div className="h-4 w-16 bg-zinc-800/50 rounded mb-2" />
            <div className="h-3 w-24 bg-zinc-850 rounded" />
          </div>
        </div>

        {/* P1 - Winner Podium (Tallest) */}
        <div className="flex flex-col items-center flex-1 max-w-50">
          <div className="w-32 md:w-44 h-32 md:h-44 bg-zinc-800/50 rounded-full mb-4" />
          <div className="w-full h-64 bg-zinc-900/80 rounded-t-xl border-t-4 border-zinc-700 flex flex-col items-center pt-4">
            <div className="h-16 w-16 bg-zinc-850/55 rounded mb-3" />
            <div className="h-5 w-20 bg-zinc-850 rounded mb-2" />
            <div className="h-3.5 w-28 bg-zinc-800 rounded" />
          </div>
        </div>

        {/* P3 - Third Podium */}
        <div className="flex flex-col items-center flex-1 max-w-50">
          <div className="w-24 md:w-32 h-24 md:h-32 bg-zinc-800/40 rounded-full mb-4" />
          <div className="w-full h-36 bg-zinc-900/60 rounded-t-xl border-t-4 border-zinc-800 flex flex-col items-center pt-4">
            <div className="h-8 w-10 bg-zinc-800/30 rounded mb-3" />
            <div className="h-4 w-16 bg-zinc-800/50 rounded mb-2" />
            <div className="h-3 w-20 bg-zinc-850 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StandingsSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-pulse">
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
