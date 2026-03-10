"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { Badge } from "@/components/ui/badge";
import { MarketStatus, Outcome } from "@/types";
import type { Market } from "@/types";

interface MarketCardProps {
  market: Market;
}

function useCountdown(endTime: bigint): string {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const diff = Number(endTime) * 1000 - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      if (d > 0) setTimeLeft(`${d}d ${h}h`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else if (m > 0) setTimeLeft(`${m}m ${s}s`);
      else setTimeLeft(`${s}s`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return timeLeft;
}

export function MarketCard({ market }: MarketCardProps) {
  const countdown = useCountdown(market.endTime);
  const totalPool = market.totalYesBets + market.totalNoBets;
  const yesPercent = totalPool > 0n
    ? Number((market.totalYesBets * 100n) / totalPool)
    : 50;

  const isActive    = market.status === MarketStatus.Active;
  const isResolved  = market.status === MarketStatus.Resolved;
  const isCancelled = market.status === MarketStatus.Cancelled;
  const isExpired   = countdown === "Expired";

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="group flex h-[280px] cursor-pointer flex-col overflow-hidden rounded-xl border border-pulse-black/10 bg-white/3 transition-all hover:border-pulse-red-500/30 hover:bg-white/5 dark:border-white/10 dark:hover:border-pulse-red-500/30">

        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
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
                <Badge variant="outline" className="text-pulse-gray">
                  Settled
                </Badge>
              )}
              {isCancelled && (
                <Badge variant="outline" className="text-pulse-gray">
                  Cancelled
                </Badge>
              )}
              {isResolved && (
                <Badge className={market.outcome === Outcome.Yes
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-pulse-down/10 text-pulse-down border-pulse-down/20"
                }>
                  {market.outcome === Outcome.Yes ? "UP Won" : "DOWN Won"}
                </Badge>
              )}
            </div>
            <h3 className="line-clamp-2 text-sm font-semibold text-pulse-black dark:text-white leading-snug">
              {market.question}
            </h3>
          </div>
          <span className="ml-3 shrink-0 font-mono text-xs text-pulse-gray">
            #{market.id.toString()}
          </span>
        </div>

        {/* YES/NO bar */}
        <div className="flex-1 px-4 flex flex-col justify-center">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              UP {yesPercent}%
            </span>
            <span className="font-semibold text-pulse-down">
              {100 - yesPercent}% DOWN
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 dark:bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-pulse-gray">
            Pool: <span className="font-medium text-pulse-black dark:text-white">
              {Number(formatEther(totalPool)).toFixed(4)} AVAX
            </span>
          </div>
        </div>

        {/* Bottom: action row */}
        <div className="px-4 pb-4">
          {isCancelled ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-pulse-gray">Refunds available</span>
            </div>
          ) : isResolved ? (
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${market.outcome === Outcome.Yes ? "text-emerald-500" : "text-pulse-down"}`}>
                {market.outcome === Outcome.Yes ? "UP" : "DOWN"} Won
              </span>
              <span className="text-xs text-pulse-gray">Claim winnings →</span>
            </div>
          ) : isExpired ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-pulse-down font-mono">Expired</span>
              <span className="text-xs text-pulse-gray">Cancel to refund</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="flex-1 rounded-lg bg-emerald-500/15 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/25"
              >
                UP ↑
              </button>
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="flex-1 rounded-lg bg-pulse-down/15 py-2 text-sm font-semibold text-pulse-down transition-colors hover:bg-pulse-down/25"
              >
                DOWN ↓
              </button>
              <span className="font-mono text-xs text-pulse-gray">{countdown}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
