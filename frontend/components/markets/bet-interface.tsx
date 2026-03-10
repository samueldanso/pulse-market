"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePlaceBet,
  useClaimWinnings,
  useClaimRefund,
  useCancelExpiredMarket,
} from "@/hooks/use-market-actions";
import { useUserBet } from "@/hooks/use-pulse-market";
import { useUserStore } from "@/stores/user-store";
import { MarketStatus, Outcome } from "@/types";
import type { Market } from "@/types";
import { MIN_BET_ETH } from "@/constants";

const BET_AMOUNTS = ["0.001", "0.01", "0.1", "0.5"];

interface BetInterfaceProps {
  market: Market;
  onSuccess: () => void;
  preSelectedSide?: "UP" | "DOWN";
}

export function BetInterface({ market, onSuccess, preSelectedSide }: BetInterfaceProps) {
  const { authenticated, login } = usePrivy();
  const { address } = useUserStore();
  const { bet, refetch: refetchBet } = useUserBet(market.id, address as `0x${string}` | undefined);
  const [amount, setAmount] = useState("0.01");
  const [selectedSide, setSelectedSide] = useState<"UP" | "DOWN" | null>(preSelectedSide ?? null);
  const { addPosition } = useUserStore();

  const { placeBet, isPending: isBetting, error: betError } = usePlaceBet(market.id);
  const { claimWinnings, isPending: isClaiming } = useClaimWinnings(market.id);
  const { claimRefund, isPending: isRefunding } = useClaimRefund(market.id);
  const { cancelExpiredMarket, isPending: isCancelling } = useCancelExpiredMarket(market.id);

  const isExpired   = Number(market.endTime) * 1000 < Date.now();
  const isActive    = market.status === MarketStatus.Active;
  const isResolved  = market.status === MarketStatus.Resolved;
  const isCancelled = market.status === MarketStatus.Cancelled;

  const hasBet   = bet && bet.amount > 0n;
  const isWinner = hasBet && isResolved &&
    ((market.outcome === Outcome.Yes && bet!.isYes) || (market.outcome === Outcome.No && !bet!.isYes));
  const canRefund = hasBet && isCancelled && !bet!.claimed;
  const canBet    = isActive && !isExpired && !hasBet && !!address;

  function handlePlaceBet() {
    if (!selectedSide) { toast.error("Select UP or DOWN first"); return; }
    placeBet(selectedSide === "UP", amount);
    setTimeout(() => {
      addPosition({
        id: `${market.id}-${address}-${Date.now()}`,
        marketId: market.id.toString(),
        side: selectedSide,
        amount: Number(amount),
        timestamp: Date.now(),
        settled: false,
      });
      refetchBet();
      onSuccess();
    }, 2000);
  }

  if (isResolved) {
    const userSideWon = hasBet && (
      (market.outcome === Outcome.Yes && bet!.isYes) ||
      (market.outcome === Outcome.No && !bet!.isYes)
    );
    return (
      <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h3 className="font-semibold text-pulse-black dark:text-white">Market Settled</h3>
        <div className={`rounded-lg p-4 text-center ${market.outcome === Outcome.Yes ? "bg-emerald-500/10" : "bg-pulse-down/10"}`}>
          <p className="text-2xl font-bold mb-1">
            {market.outcome === Outcome.Yes
              ? <span className="text-emerald-500">UP Won</span>
              : <span className="text-pulse-down">DOWN Won</span>
            }
          </p>
        </div>

        {isWinner && !bet!.claimed && (
          <Button
            size="lg"
            disabled={isClaiming}
            onClick={() => { claimWinnings(); setTimeout(onSuccess, 2000); }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold text-white"
          >
            {isClaiming ? "Claiming..." : "Claim Winnings"}
          </Button>
        )}

        {hasBet && !userSideWon && (
          <p className="text-center text-sm text-pulse-gray">
            You bet <span className={bet!.isYes ? "text-emerald-500" : "text-pulse-down"}>
              {bet!.isYes ? "UP" : "DOWN"}
            </span> · {Number(formatEther(bet!.amount)).toFixed(4)} AVAX
          </p>
        )}

        {bet?.claimed && (
          <p className="text-center text-xs text-pulse-gray">Already claimed</p>
        )}
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h3 className="font-semibold text-pulse-black dark:text-white">Market Cancelled</h3>
        <p className="text-sm text-pulse-gray">This market expired without resolution. Refunds are available.</p>
        {canRefund && (
          <Button
            size="lg"
            disabled={isRefunding}
            onClick={() => { claimRefund(); setTimeout(onSuccess, 2000); }}
            className="w-full font-bold"
          >
            {isRefunding ? "Refunding..." : "Claim Refund"}
          </Button>
        )}
        {bet?.claimed && <p className="text-center text-xs text-pulse-gray">Already refunded</p>}
      </div>
    );
  }

  if (isExpired && isActive) {
    return (
      <div className="space-y-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h3 className="font-semibold text-pulse-black dark:text-white">Market Expired</h3>
        <p className="text-sm text-pulse-gray">No resolution was submitted. Anyone can cancel this market to enable refunds.</p>
        <Button
          size="lg"
          disabled={isCancelling}
          onClick={() => { cancelExpiredMarket(); setTimeout(onSuccess, 2000); }}
          variant="outline"
          className="w-full border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
        >
          {isCancelling ? "Cancelling..." : "Cancel & Enable Refunds"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
      <h3 className="font-semibold text-pulse-black dark:text-white">Place Your Bet</h3>

      {!authenticated ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-pulse-gray">Connect your wallet to place a bet</p>
          <Button
            size="lg"
            onClick={() => login()}
            className="w-full bg-pulse-red-500 hover:bg-pulse-red-600 font-bold text-white"
          >
            Connect Wallet
          </Button>
        </div>
      ) : hasBet ? (
        <div className="rounded-lg border border-white/10 p-4 text-center">
          <p className="text-sm text-pulse-gray">
            You bet{" "}
            <span className={bet!.isYes ? "font-bold text-emerald-500" : "font-bold text-pulse-down"}>
              {bet!.isYes ? "UP" : "DOWN"}
            </span>{" "}
            with{" "}
            <span className="font-semibold text-pulse-black dark:text-white">
              {Number(formatEther(bet!.amount)).toFixed(4)} AVAX
            </span>
          </p>
        </div>
      ) : (
        <>
          {/* UP / DOWN selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedSide("UP")}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                selectedSide === "UP"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
              }`}
            >
              UP ↑
            </button>
            <button
              type="button"
              onClick={() => setSelectedSide("DOWN")}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                selectedSide === "DOWN"
                  ? "bg-pulse-down text-white shadow-lg shadow-pulse-down/25"
                  : "bg-pulse-down/15 text-pulse-down hover:bg-pulse-down/25"
              }`}
            >
              DOWN ↓
            </button>
          </div>

          {/* Amount presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-pulse-gray">Amount (AVAX)</label>
            <div className="flex gap-2">
              {BET_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                    amount === a
                      ? "border-pulse-red-500/50 bg-pulse-red-500/10 text-pulse-black dark:text-white"
                      : "border-white/10 text-pulse-gray hover:border-white/20"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder={`Min ${MIN_BET_ETH} AVAX`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={MIN_BET_ETH}
              step="0.001"
              className="mt-1"
            />
          </div>

          <Button
            size="lg"
            disabled={!canBet || isBetting || !selectedSide}
            onClick={handlePlaceBet}
            className={`w-full font-bold text-white ${
              selectedSide === "DOWN"
                ? "bg-pulse-down hover:bg-pulse-down/90"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {isBetting
              ? "Confirming..."
              : selectedSide
                ? `Bet ${selectedSide} · ${amount} AVAX`
                : "Select UP or DOWN"}
          </Button>

          {betError && (
            <p className="text-xs text-pulse-down text-center">
              {(betError as {shortMessage?: string}).shortMessage ?? betError.message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
