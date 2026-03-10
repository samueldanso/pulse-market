# PulseMarket — Attention Markets

> Real-time prediction market for trading social attention and narratives — built on Avalanche with fast, low-cost on-chain settlement.

[![Avalanche](https://img.shields.io/badge/Built%20on-Avalanche-red)](https://avax.network)
[![Fuji](https://img.shields.io/badge/Network-Fuji%20Testnet-orange)](https://testnet.snowtrace.io)

---

## Overview

PulseMarket turns social attention into a tradable asset. Users trade directly on narratives and momentum through UP/DOWN markets that resolve on-chain. All funds are escrowed in Avalanche smart contracts — trustless, transparent, verifiable.

**One line:** Trade narrative momentum before the market catches up.

---

## Problem

Social attention moves markets faster than price data. Crypto traders already speculate on narratives informally — but no structured, trust-minimized market exists for trading attention in real time. Existing prediction markets are too slow, too expensive, and designed for static binary outcomes — not fast-moving attention dynamics.

---

## Solution

PulseMarket introduces a new market primitive: attention prediction markets on Avalanche.

- Users trade UP or DOWN on narrative markets that resolve quickly
- All funds escrowed on-chain — no custodians, no off-chain state
- Fast, low-cost execution on Avalanche C-Chain
- Transparent, verifiable settlement recorded on-chain

---

## Tech Stack

| Layer           | Technology                                         |
| --------------- | -------------------------------------------------- |
| Smart Contracts | Solidity 0.8.25, Foundry                           |
| Network         | Avalanche Fuji Testnet (C-Chain, chainId 43113)    |
| Frontend        | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui |
| Wallet          | Privy + wagmi + viem                               |
| Runtime         | Bun                                                |
| Deployment      | Vercel                                             |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                         │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │  Markets   │  │    Bet     │  │ Dashboard  │  │  Admin   │  │
│  │   Feed     │  │ Interface  │  │            │  │  Panel   │  │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────┬─────┘  │
└────────┼───────────────┼───────────────┼───────────────┼────────┘
         │               │               │               │
         └───────────────┴───────┬───────┴───────────────┘
                                 │
                    wagmi + viem │ (read/write hooks)
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AVALANCHE FUJI C-CHAIN                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    PulseMarket.sol                        │  │
│  │                                                           │  │
│  │  createMarket(question, duration)      ← Admin           │  │
│  │  placeBet(marketId, isYes)             ← User            │  │
│  │  resolveMarket(marketId, outcome)      ← Admin (owner)   │  │
│  │  claimWinnings(marketId)               ← Winner          │  │
│  │  claimRefund(marketId)                 ← Bettor          │  │
│  │  cancelExpiredMarket(marketId)         ← Anyone          │  │
│  │  getMarkets(offset, limit)             ← View            │  │
│  │                                                           │  │
│  │  Fee: 1% platform + 2% creator + 97% winners            │  │
│  │  All funds escrowed in contract                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Onchain vs Offchain

```
OFFCHAIN                          ONCHAIN
────────                          ────────
UI rendering                      Market state
Wallet auth (Privy)               Bet amounts + sides
Read contract state  ──────────►  Fund escrow
Write transactions   ──────────►  Resolution outcome
                                  Fee distribution
                                  Winner payouts
```

---

## Smart Contract

### Core Functions

```solidity
// Admin
createMarket(string question, uint256 duration) payable
resolveMarket(uint256 marketId, bool conditionMet) onlyOwner
cancelExpiredMarket(uint256 marketId)
pause() / unpause() onlyOwner
withdrawPlatformFees() onlyOwner

// User
placeBet(uint256 marketId, bool isYes) payable
claimWinnings(uint256 marketId)
claimRefund(uint256 marketId)
withdrawCreatorFee(uint256 marketId)

// Views
getMarket(uint256 marketId) view
getMarkets(uint256 offset, uint256 limit) view
getBet(uint256 marketId, address bettor) view
getMarketCount() view
```

### Data Structures

```solidity
enum MarketStatus { Active, Resolved, Cancelled }
enum Outcome      { None, Yes, No }

struct Market {
  uint256      id;
  address      creator;
  string       question;
  uint256      endTime;
  uint256      totalYesBets;
  uint256      totalNoBets;
  MarketStatus status;
  Outcome      outcome;
  uint256      createdAt;
  uint256      resolvedAt;
  uint256      creatorFeeCollected;
}

struct Bet {
  address bettor;
  uint256 marketId;
  bool    isYes;
  uint256 amount;
  bool    claimed;
}
```

### Fee Structure

```
Total Pool = all UP bets + all DOWN bets (stored as YES/NO on-chain)
     │
     ├── 1%  → Platform (contract owner)
     ├── 2%  → Market creator
     └── 97% → Winners (proportional to stake in winning pool)
```

### Constants

```
MIN_BET           = 0.001 AVAX
MIN_CREATION_BOND = 0.01 AVAX  (counts as creator's UP bet in the UI)
MIN_DURATION      = 5 minutes
MAX_DURATION      = 30 days
```

---

## User Flow

### Full Journey

```
┌──────────────┐
│ Land on app  │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌─────────────────────────────┐
│ Connect      │────►│ Privy modal                 │
│ Wallet       │     │ Embedded or external wallet  │
└──────┬───────┘     └─────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Browse       │  Markets feed — question, pool size,
│ Markets      │  time remaining, UP/DOWN split
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Select       │  Market detail — full context,
│ Market       │  pool breakdown, bet interface
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌─────────────────────────────┐
│ Place Bet    │────►│ Select UP or DOWN           │
│              │     │ Enter AVAX amount           │
│              │     │ Confirm wallet signature    │
└──────┬───────┘     └─────────────────────────────┘
       │
       │  AVAX escrowed in PulseMarket.sol on Fuji
       │
       ▼
┌──────────────┐
│ Wait for     │  Market timer counts down
│ Resolution   │  Admin calls resolveMarket() on-chain
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌─────────────────────────────┐
│ Claim        │────►│ Winner: proportional AVAX   │
│ Result       │     │ Loser: nothing to claim     │
│              │     │ Cancelled: full refund      │
└──────────────┘     └─────────────────────────────┘
```

### Transaction Flow (Onchain)

```
placeBet(marketId, isYes)
    │
    ├── Validates: min bet, market active, not expired, one bet per address
    ├── Records bet: _bets[marketId][msg.sender]
    ├── Adds to pool: totalYesBets or totalNoBets
    └── Emits: BetPlaced(marketId, bettor, isYes, amount)

resolveMarket(marketId, conditionMet)  ← onlyOwner
    │
    ├── Sets: market.status = Resolved
    ├── Sets: market.outcome = Yes or No
    └── Emits: MarketResolved(marketId, outcome, totalYes, totalNo)

claimWinnings(marketId)
    │
    ├── Validates: resolved, user bet, winning side, not claimed
    ├── Calculates: proportional share of 97% net pool
    ├── Marks: bet.claimed = true
    └── Transfers: AVAX to winner
```

---

## MoSCoW Framework

### Must Have

- Smart contract deployed on Avalanche Fuji C-Chain
- Market creation (admin) with question and duration
- UP/DOWN betting with AVAX escrowed on-chain
- Admin market resolution with outcome on-chain
- Claim winnings — proportional payout to winners
- Wallet connection via Privy
- Markets feed UI
- Market detail page with bet interface
- Full flow: create → bet → resolve → claim

### Should Have

- Market countdown timer in UI
- UP vs DOWN pool split visualization
- User dashboard with active bets
- Admin panel for market creation and resolution
- Transaction status feedback
- Mobile-responsive UI

### Could Have

- Leaderboard by win rate and volume
- Claim refund UI for cancelled markets
- Creator fee withdrawal UI
- Market search and filtering
- Historical resolved markets feed

### Won't Have (This Submission)

- Chainlink oracle automated resolution → planned for v2 production
- Gasless execution layer → direct on-chain for now planned for v2 production
- Social data API for automatic market creation → manual for MVP planned for v2 production
- Mobile native app

---

## Network

|          |                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Network  | Avalanche Fuji C-Chain                                                                                                          |
| RPC      | `https://api.avax-test.network/ext/bc/C/rpc`                                                                                    |
| Chain ID | `43113`                                                                                                                         |
| Currency | AVAX                                                                                                                            |
| Explorer | https://testnet.snowtrace.io                                                                                                    |
| Contract | [`0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21`](https://testnet.snowtrace.io/address/0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21) |

---

## Roadmap

### Phase 1 — MVP (Current Submission)

- ✅ PulseMarket.sol deployed on Fuji
- ✅ On-chain betting and settlement
- ✅ Privy wallet integration
- ✅ Market feed and bet UI

### Phase 2 — Production

- Chainlink oracle integration — automated resolution using real social attention data feeds
- Gasless execution layer — sub-second micro-bets without gas friction
- Social data API — automated market creation from trending narratives
- Avalanche mainnet deployment

### Phase 3 — Scale

- AI agent for market creation and resolution reasoning
- Leaderboard and social features
- Mobile app

---

## Video Demo Link

[ADD AFTER RECORDING]

---

## Live Demo Link

[https://pulse-market-avax.vercel.app](https://pulse-market-avax.vercel.app/)
