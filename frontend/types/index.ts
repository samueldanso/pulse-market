import type { Address } from "viem";

// ─── Enums (match contract uint8 values) ─────────────────────────────────────

export const MarketStatus = {
  Active:    0,
  Resolved:  1,
  Cancelled: 2,
} as const;
export type MarketStatus = (typeof MarketStatus)[keyof typeof MarketStatus];

export const Outcome = {
  None: 0,
  Yes:  1,
  No:   2,
} as const;
export type Outcome = (typeof Outcome)[keyof typeof Outcome];

// ─── Structs ──────────────────────────────────────────────────────────────────

export interface Market {
  id:                  bigint;
  creator:             Address;
  question:            string;
  endTime:             bigint;
  totalYesBets:        bigint;
  totalNoBets:         bigint;
  status:              MarketStatus;
  outcome:             Outcome;
  createdAt:           bigint;
  resolvedAt:          bigint;
  creatorFeeCollected: bigint;
}

export interface Bet {
  bettor:   Address;
  marketId: bigint;
  isYes:    boolean;
  amount:   bigint;
  claimed:  boolean;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export interface CreateMarketForm {
  question:        string;
  durationSeconds: number;
}

export type BetSide = "UP" | "DOWN";

export interface Position {
  id:        string;
  marketId:  string;
  side:      BetSide;
  amount:    number;
  timestamp: number;
  settled:   boolean;
  payout?:   number;
}
