export type BetSide = "YES" | "NO";
export type MarketStatus = "Active" | "Resolved" | "Cancelled";
export type Outcome = "None" | "Yes" | "No";

export interface Market {
  id: bigint;
  creator: `0x${string}`;
  question: string;
  endTime: bigint;
  totalYesBets: bigint;
  totalNoBets: bigint;
  status: number;
  outcome: number;
  createdAt: bigint;
  resolvedAt: bigint;
  creatorFeeCollected: bigint;
}

export interface Bet {
  bettor: `0x${string}`;
  marketId: bigint;
  isYes: boolean;
  amount: bigint;
  claimed: boolean;
}

export interface Position {
  id: string;
  marketId: string;
  side: BetSide;
  amount: number;
  timestamp: number;
  settled: boolean;
  payout?: number;
}

export interface UserState {
  address: string;
  balance: number;
  positions: Position[];
}
