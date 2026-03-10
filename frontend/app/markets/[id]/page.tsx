"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BetInterface } from "@/components/markets/bet-interface";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarket } from "@/hooks/use-pulse-market";
import { useResolveMarket } from "@/hooks/use-market-actions";
import { MarketStatus, Outcome } from "@/types";
import { FUJI_EXPLORER } from "@/constants";

function useCountdown(endTime: bigint): string {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function update() {
      const diff = Number(endTime) * 1000 - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else if (m > 0) setTimeLeft(`${m}m ${s}s`);
      else setTimeLeft(`${s}s`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return timeLeft;
}

export default function MarketDetailPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const marketId     = BigInt(params.id as string);
  const sideParam    = searchParams.get("side");
  const preSelected  = (sideParam === "UP" || sideParam === "DOWN") ? sideParam as "UP" | "DOWN" : undefined;

  const { address }                    = useAccount();
  const { market, isLoading, refetch } = useMarket(marketId);
  const countdown                      = useCountdown(market?.endTime ?? 0n);

  const { resolveMarket, isPending: isResolving } = useResolveMarket(marketId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-20">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-pulse-gray">Market not found</p>
      </div>
    );
  }

  const totalPool  = market.totalYesBets + market.totalNoBets;
  const yesPercent = totalPool > 0n ? Number((market.totalYesBets * 100n) / totalPool) : 50;
  const isActive   = market.status === MarketStatus.Active;
  const isResolved = market.status === MarketStatus.Resolved;
  const isExpired  = countdown === "Expired";

  return (
    <main className="mx-auto max-w-5xl px-6 py-4">
      <Link
        href="/markets"
        className="mb-6 inline-flex items-center text-sm text-pulse-gray hover:text-pulse-black dark:hover:text-white"
      >
        ← Back to Markets
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Market info */}
        <div className="space-y-4 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-white/[0.08] bg-white/[0.03] dark:border-white/[0.08] dark:bg-white/[0.03]">
              <CardContent className="p-6">
                {/* Status badges */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {isActive && !isExpired && (
                    <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </Badge>
                  )}
                  {isActive && isExpired && (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                      Expired
                    </Badge>
                  )}
                  {isResolved && (
                    <>
                      <Badge variant="outline" className="text-pulse-gray">Settled</Badge>
                      <Badge className={market.outcome === Outcome.Yes
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-pulse-down/10 text-pulse-down border-pulse-down/20"
                      }>
                        {market.outcome === Outcome.Yes ? "UP Won" : "DOWN Won"}
                      </Badge>
                    </>
                  )}
                  <span className="ml-auto font-mono text-xs text-pulse-gray">
                    #{market.id.toString()}
                  </span>
                </div>

                <h1 className="mb-4 text-xl font-bold text-pulse-black dark:text-white leading-snug">
                  {market.question}
                </h1>

                {/* YES/NO progress */}
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">UP {yesPercent}%</span>
                  <span className="font-bold text-pulse-down">{100 - yesPercent}% DOWN</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                    style={{ width: `${yesPercent}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pool stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "UP Pool",   value: `${Number(formatEther(market.totalYesBets)).toFixed(4)} AVAX`, color: "text-emerald-500" },
              { label: "DOWN Pool", value: `${Number(formatEther(market.totalNoBets)).toFixed(4)} AVAX`,  color: "text-pulse-down" },
              { label: "Total",    value: `${Number(formatEther(totalPool)).toFixed(4)} AVAX`,           color: "text-pulse-black dark:text-white" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className={`text-xs font-medium ${s.color} mb-1`}>{s.label}</p>
                <p className="font-mono text-base font-bold text-pulse-black dark:text-white">{s.value}</p>
                {s.label === "Total" && (
                  <p className="mt-0.5 text-xs text-pulse-gray">
                    {isExpired
                      ? <span className="text-pulse-down">Expired</span>
                      : <span>{countdown} left</span>
                    }
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Market info */}
          <Card className="border-white/[0.08] bg-white/[0.03]">
            <CardContent className="p-6 space-y-3">
              <h3 className="font-semibold text-pulse-black dark:text-white">Market Info</h3>
              <InfoRow label="Creator"  value={`${market.creator.slice(0, 6)}…${market.creator.slice(-4)}`} mono />
              <InfoRow label="Created"  value={new Date(Number(market.createdAt) * 1000).toLocaleString()} />
              <InfoRow label="Expires"  value={new Date(Number(market.endTime)   * 1000).toLocaleString()} />
              {market.resolvedAt > 0n && (
                <InfoRow label="Settled" value={new Date(Number(market.resolvedAt) * 1000).toLocaleString()} highlight />
              )}
              <a
                href={`${FUJI_EXPLORER}/address/${market.creator}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-pulse-red-500 hover:text-pulse-red-400 transition-colors"
              >
                View creator on Snowtrace →
              </a>
            </CardContent>
          </Card>

          {/* Owner resolve panel */}
          {isActive && !isExpired && address?.toLowerCase() !== undefined && (
            <Card className="border-pulse-red-500/20 bg-pulse-red-500/5">
              <CardContent className="p-6">
                <h3 className="mb-1 font-semibold text-pulse-black dark:text-white">Owner: Resolve Market</h3>
                <p className="mb-4 text-xs text-pulse-gray">
                  Only the contract owner can resolve. Choose the winning outcome.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { resolveMarket(true); setTimeout(() => { refetch(); toast.success("Market resolved: UP wins"); }, 2000); }}
                    disabled={isResolving}
                    className="flex-1 rounded-lg bg-emerald-500/15 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
                  >
                    Resolve UP
                  </button>
                  <button
                    type="button"
                    onClick={() => { resolveMarket(false); setTimeout(() => { refetch(); toast.success("Market resolved: DOWN wins"); }, 2000); }}
                    disabled={isResolving}
                    className="flex-1 rounded-lg bg-pulse-down/15 py-2.5 text-sm font-semibold text-pulse-down hover:bg-pulse-down/25 disabled:opacity-50"
                  >
                    Resolve DOWN
                  </button>
                </div>
                {isResolving && <p className="mt-2 text-center text-xs text-pulse-gray">Confirming...</p>}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Bet interface */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <BetInterface
              market={market}
              onSuccess={refetch}
              preSelectedSide={preSelected}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value, mono, highlight }: {
  label:      string;
  value:      string;
  mono?:      boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-pulse-gray shrink-0">{label}</span>
      <span className={`text-xs text-right break-all ${mono ? "font-mono" : ""} ${highlight ? "text-pulse-red-500" : "text-pulse-black dark:text-white"}`}>
        {value}
      </span>
    </div>
  );
}
