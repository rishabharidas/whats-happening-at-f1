import React from "react";
import Link from "next/link";
import TechLexicon from "@/components/explore/TechLexicon";

export const dynamic = "force-dynamic";

export default function LexiconPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans w-full py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        {/* NAV HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/explore"
              className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              &larr; Back to Explore
            </Link>
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter">
            TECH <span className="text-red-600">LEXICON</span>
          </h2>
        </div>

        {/* FULL TECH LEXICON VIEW */}
        <TechLexicon isPreview={false} />
      </div>
    </div>
  );
}
