"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LeaderboardPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-pulse-black dark:text-white">Leaderboard</h1>
        <p className="mt-2 text-pulse-gray">
          Top traders by PnL and volume — coming soon.
        </p>
      </div>

      <Card className="border-white/[0.08] bg-white/[0.03]">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="rounded-full bg-white/5 p-4">
            <svg
              className="h-10 w-10 text-pulse-gray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-pulse-black dark:text-white">
            Leaderboard is under construction
          </p>
          <p className="text-xs text-pulse-gray text-center max-w-xs">
            We&apos;ll rank traders by wins, volume, and ROI. Check back after markets start resolving.
          </p>
          <Button asChild variant="outline" className="mt-2 border-white/10 hover:border-white/20">
            <Link href="/markets">Back to Markets</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
