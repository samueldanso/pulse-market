"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { parseEther } from "viem";
import { PULSE_MARKET_ABI } from "@/lib/contracts/abis";
import { getPulseMarketAddress } from "@/lib/contracts/addresses";
import { CREATION_BOND_ETH } from "@/constants";
import type { CreateMarketForm } from "@/types";

// ─── Create Market ────────────────────────────────────────────────────────────

export function useCreateMarket() {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

  function createMarket(form: CreateMarketForm) {
    writeContract({
      address:      getPulseMarketAddress(chainId),
      abi:          PULSE_MARKET_ABI,
      functionName: "createMarket",
      args:         [form.question, BigInt(form.durationSeconds)],
      value:        parseEther(CREATION_BOND_ETH),
    });
  }

  return { createMarket, hash, receipt, isPending: isPending || isConfirming, isSuccess, error, reset };
}

// ─── Place Bet ────────────────────────────────────────────────────────────────

export function usePlaceBet(marketId: bigint) {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function placeBet(isYes: boolean, amountEth: string) {
    writeContract({
      address:      getPulseMarketAddress(chainId),
      abi:          PULSE_MARKET_ABI,
      functionName: "placeBet",
      args:         [marketId, isYes],
      value:        parseEther(amountEth),
    });
  }

  return { placeBet, hash, isPending: isPending || isConfirming, isSuccess, error, reset };
}

// ─── Resolve Market (owner only) ──────────────────────────────────────────────

export function useResolveMarket(marketId: bigint) {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function resolveMarket(conditionMet: boolean) {
    writeContract({
      address:      getPulseMarketAddress(chainId),
      abi:          PULSE_MARKET_ABI,
      functionName: "resolveMarket",
      args:         [marketId, conditionMet],
    });
  }

  return { resolveMarket, hash, isPending: isPending || isConfirming, isSuccess, error, reset };
}

// ─── Claim Winnings ───────────────────────────────────────────────────────────

export function useClaimWinnings(marketId: bigint) {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function claimWinnings() {
    writeContract({
      address:      getPulseMarketAddress(chainId),
      abi:          PULSE_MARKET_ABI,
      functionName: "claimWinnings",
      args:         [marketId],
    });
  }

  return { claimWinnings, hash, isPending: isPending || isConfirming, isSuccess, error, reset };
}

// ─── Claim Refund ─────────────────────────────────────────────────────────────

export function useClaimRefund(marketId: bigint) {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function claimRefund() {
    writeContract({
      address:      getPulseMarketAddress(chainId),
      abi:          PULSE_MARKET_ABI,
      functionName: "claimRefund",
      args:         [marketId],
    });
  }

  return { claimRefund, hash, isPending: isPending || isConfirming, isSuccess, error, reset };
}

// ─── Cancel Expired Market ────────────────────────────────────────────────────

export function useCancelExpiredMarket(marketId: bigint) {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function cancelExpiredMarket() {
    writeContract({
      address:      getPulseMarketAddress(chainId),
      abi:          PULSE_MARKET_ABI,
      functionName: "cancelExpiredMarket",
      args:         [marketId],
    });
  }

  return { cancelExpiredMarket, hash, isPending: isPending || isConfirming, isSuccess, error, reset };
}
