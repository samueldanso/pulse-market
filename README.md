# PulseMarkets — Instant Attention Trading on Avalanche

> Real-time prediction market for trading social attention and narratives — built on Avalanche with fast, low-cost on-chain settlement.

[![Avalanche](https://img.shields.io/badge/Built%20on-Avalanche-red)](https://avax.network)
[![Fuji](https://img.shields.io/badge/Network-Fuji%20Testnet-orange)](https://testnet.snowtrace.io)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

[🎥 **Video Demo**](#) | [🌐 **Live Demo**](#) | [📄 **Full Docs**](./docs/technical-docs.md)

---

## Overview

PulseMarkets turns social attention into a tradable asset. Users trade UP or DOWN on narrative markets that resolve on-chain. All funds escrowed in Avalanche smart contracts — trustless, transparent, verifiable.

**One line:** Trade narrative momentum before the market catches up.

---

## Problem

Social attention moves markets faster than price data. Crypto traders already speculate on narratives informally — but no structured, trust-minimized market exists for trading attention in real time. Existing prediction markets are too slow, too expensive, and designed for static binary outcomes — not fast-moving attention dynamics.

---

## Solution

- Trade UP or DOWN on narrative markets with clear resolution criteria
- All funds escrowed directly on-chain — no custodians, no off-chain state
- Fast, low-cost execution on Avalanche C-Chain
- Transparent, verifiable settlement recorded on-chain
- Fair payout: 97% of pool distributed proportionally to winners

---

## Architecture

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
│  │                                                           │  │
│  │  Fee: 1% platform + 2% creator + 97% winners            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flow

```
Connect Wallet
      │
      ▼
Browse Markets ──► Select Market ──► Place Bet (UP or DOWN)
                                           │
                                           │ AVAX escrowed on-chain
                                           ▼
                                    Wait for Resolution
                                           │
                                           │ Admin resolves on-chain
                                           ▼
                              ┌────────────────────────┐
                              │ Winner → Claim AVAX    │
                              │ Loser  → No claim      │
                              │ Cancel → Full refund   │
                              └────────────────────────┘
```

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

## Smart Contract

**Deployed on Avalanche Fuji Testnet**

- Contract Address: [`0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21`](https://testnet.snowtrace.io/address/0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21)
- Explorer: [Snowtrace](https://testnet.snowtrace.io/address/0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21)

### Fee Structure

```
Total Pool
    ├── 1%  → Platform (owner)
    ├── 2%  → Market creator
    └── 97% → Winners (proportional to stake)
```

### Constants

```
MIN_BET           = 0.001 AVAX
MIN_CREATION_BOND = 0.01 AVAX
MIN_DURATION      = 5 minutes
MAX_DURATION      = 30 days
```

---

## Setup

### Prerequisites

- Bun
- Node.js 18+
- Foundry

### Install

```bash
git clone https://github.com/samueldanso/pulse-market.git
cd pulse-market
bun install
```

### Environment Variables

Create `.env.local` in `frontend/`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=         # Privy dashboard
NEXT_PUBLIC_CONTRACT_ADDRESS=     # Deployed PulseMarket on Fuji
```

Create `.env` in `contracts/`:

```env
DEPLOYER_PRIVATE_KEY=0x...
```

### Run

```bash
# Frontend
cd frontend && bun dev

# Deploy contracts
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url https://api.avax-test.network/ext/bc/C/rpc \
  --broadcast
```

### Fuji Testnet

|          |                                              |
| -------- | -------------------------------------------- |
| RPC      | `https://api.avax-test.network/ext/bc/C/rpc` |
| Chain ID | `43113`                                      |
| Currency | AVAX                                         |
| Explorer | https://testnet.snowtrace.io                 |
| Faucet   | https://faucet.avax.network                  |

---

## Roadmap

### Phase 1 — MVP (Current)

- ✅ PulseMarket.sol deployed on Fuji
- ✅ On-chain betting and settlement
- ✅ Privy wallet integration
- ✅ Market feed and bet UI

### Phase 2 — Production

- Chainlink oracle for automated resolution
- Gasless execution layer
- Social data API for attention-based market creation
- Avalanche mainnet

### Phase 3 — Scale

- AI agent for market creation and resolution
- Leaderboard and social features
- Mobile app

---

## License

MIT

---

## Built for Avalanche Build Games 2026

**Team:** Samuel Danso — Engineering & Product Lead
**Contact:** me.samueldanso@gmail.com
**Team:** John Okyere — Backend & Smart Contract Engineer
**Contact:** me.samueldanso@gmail.com
