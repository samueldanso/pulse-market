import type { Address } from "viem";
import { env } from "@/env";

export const FUJI_CHAIN_ID = 43113;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

const CONTRACT_ADDRESSES: Record<number, { PulseMarket: Address }> = {
  [FUJI_CHAIN_ID]: {
    PulseMarket: (env.NEXT_PUBLIC_CONTRACT_ADDRESS || ZERO_ADDRESS) as Address,
  },
};

export function getPulseMarketAddress(chainId: number): Address {
  return CONTRACT_ADDRESSES[chainId]?.PulseMarket ?? ZERO_ADDRESS;
}

export function isCorrectChain(chainId: number): boolean {
  return chainId === FUJI_CHAIN_ID;
}
