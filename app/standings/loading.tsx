import { StandingsSkeleton } from "@/components/section/Skeletons";

export default function StandingsLoading() {
  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-zinc-100 py-6 sm:py-10">
      <StandingsSkeleton />
    </div>
  );
}

