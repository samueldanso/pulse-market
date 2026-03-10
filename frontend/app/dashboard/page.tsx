"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useBalance } from "wagmi";
import { formatEther } from "viem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUserStore } from "@/stores/user-store";
import { FUJI_EXPLORER } from "@/constants";

export default function DashboardPage() {
  const { authenticated, login } = usePrivy();
  const { address, positions } = useUserStore();

  const { data: balanceData } = useBalance({
    address: address as `0x${string}` | undefined,
    query: { enabled: !!address },
  });

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-pulse-black dark:text-white">Dashboard</h1>
        <p className="mb-6 text-pulse-gray">
          Connect your wallet to view your positions and balance.
        </p>
        <Button
          onClick={() => login()}
          className="bg-pulse-red-500 hover:bg-pulse-red-600 text-white font-semibold"
        >
          Connect Wallet
        </Button>
      </main>
    );
  }

  const totalStaked = positions.reduce((sum, p) => sum + p.amount, 0);
  const openPositions = positions.filter((p) => !p.settled);
  const settledPositions = positions.filter((p) => p.settled);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-pulse-black dark:text-white">Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="border-white/[0.08] bg-white/[0.03]">
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-pulse-gray">Wallet Balance</p>
            <p className="mt-1 font-mono text-2xl font-bold text-pulse-black dark:text-white">
              {balanceData ? Number(formatEther(balanceData.value)).toFixed(4) : "—"} AVAX
            </p>
            {address && (
              <p className="mt-2">
                <a
                  href={`${FUJI_EXPLORER}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-pulse-red-500 hover:underline"
                >
                  View on Snowtrace →
                </a>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/[0.08] bg-white/[0.03]">
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-pulse-gray">Total Staked</p>
            <p className="mt-1 font-mono text-2xl font-bold text-pulse-black dark:text-white">
              {totalStaked.toFixed(4)} AVAX
            </p>
            <p className="mt-1 text-[10px] text-pulse-gray">
              Across {positions.length} bet{positions.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.08] bg-white/[0.03]">
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-pulse-gray">Open Positions</p>
            <p className="mt-1 font-mono text-2xl font-bold text-pulse-black dark:text-white">
              {openPositions.length}
            </p>
            <p className="mt-1 text-[10px] text-pulse-gray">
              {settledPositions.length} settled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Positions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-pulse-black dark:text-white">Your Positions</h2>

        {positions.length === 0 ? (
          <Card className="border-white/[0.08] bg-white/[0.03]">
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-sm text-pulse-gray">No positions yet. Place your first bet!</p>
              <Button asChild className="bg-pulse-red-500 hover:bg-pulse-red-600 text-white">
                <Link href="/markets">Browse Markets</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {[...positions].reverse().map((position) => (
              <Card key={position.id} className="border-white/[0.08] bg-white/[0.03]">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        position.side === "UP"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-pulse-down/15 text-pulse-down border-pulse-down/20"
                      }
                    >
                      {position.side} {position.side === "UP" ? "↑" : "↓"}
                    </Badge>
                    <div>
                      <Link
                        href={`/markets/${position.marketId}`}
                        className="text-sm font-medium text-pulse-black dark:text-white hover:text-pulse-red-500 transition-colors"
                      >
                        Market #{position.marketId}
                      </Link>
                      <p className="text-xs text-pulse-gray">
                        {new Date(position.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-pulse-black dark:text-white">
                      {position.amount.toFixed(4)} AVAX
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        position.settled
                          ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "border-white/10 text-pulse-gray"
                      }`}
                    >
                      {position.settled ? "Settled" : "Open"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
