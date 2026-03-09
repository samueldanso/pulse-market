# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project: PulseMarkets (Avalanche Build Games — Stage 2)

Real-time prediction market for trading social attention/narratives. Users bet YES/NO on markets that resolve on-chain. Built by adapting a Somnia-chain reference implementation to run on **Avalanche Fuji Testnet (C-Chain)** with Hardhat deployment.

---

## Repo Structure

```
pulse-market-avax/
├── frontend/              # Active build target — Next.js 16 starter (wire to contract here)
├── contracts/             # Smart contracts (create this — copy & adapt from reference)
├── resources/
│   ├── Pulse-Prediction-Market/   # PRIMARY reference — Somnia version (read-only)
│   │   ├── contracts/             # Hardhat project + PulseMarket.sol
│   │   └── frontend/              # wagmi hooks, ABIs, types to adapt
│   └── pulse-markets/             # Yellow Network version (secondary reference)
├── docs/PRD.md            # Full product requirements — read first
└── CLAUDE.md              # This file
```

**Rule**: Never modify anything in `resources/`. Adapt into `frontend/` and `contracts/`.

---

## Commands

### Frontend (`/frontend`)
```bash
bun dev           # Dev server (Turbopack)
bun run build     # Production build
bun run lint      # ESLint
bun run format    # Prettier
bun run typecheck # tsc --noEmit
```

### Contracts (`/contracts` — Foundry)
```bash
forge build                                                                    # Compile
forge test                                                                     # Run tests
forge test -vvvv                                                               # Verbose traces
forge script script/Deploy.s.sol --rpc-url $FUJI_RPC --broadcast              # Deploy to Fuji
forge verify-contract <addr> src/PulseMarket.sol:PulseMarket \
  --chain 43113 \
  --verifier-url https://api.routescan.io/v2/network/testnet/evm/43113/etherscan/api \
  --etherscan-api-key verifyContract                                           # Verify on Snowtrace
```

---

## Smart Contract: What to Adapt

Source: `resources/Pulse-Prediction-Market/contracts/contracts/PulseMarket.sol`

This is a production-quality contract. The **only changes needed** from the Somnia version:

1. **`resolveMarket`**: Change guard from `onlyEventHandler` → `onlyOwner`
2. **`createMarket`**: Remove Somnia-specific reactive params (`watchedContract`, `eventTopic`, `conditionData`) — simplify to `(string question, uint256 duration)`
3. **`setEventHandler`**: Remove (no longer needed)
4. **`eventHandler` state var**: Remove

Everything else stays: fee structure, `claimWinnings`, `claimRefund`, `cancelExpiredMarket`, `withdrawCreatorFee`, `getMarkets(offset, limit)`, `getBet`.

### Contract Interface (Adapted)

```solidity
// Admin (onlyOwner)
createMarket(string question, uint256 duration) payable  // 0.01 AVAX bond required
resolveMarket(uint256 marketId, bool conditionMet)        // YES=true, NO=false
pause() / unpause()
withdrawPlatformFees()

// User
placeBet(uint256 marketId, bool isYes) payable           // min 0.001 AVAX, one bet per address per market
claimWinnings(uint256 marketId)
claimRefund(uint256 marketId)                            // only if market Cancelled
withdrawCreatorFee(uint256 marketId)                     // market creator only, after resolution

// Views
getMarket(uint256 marketId) → Market
getMarkets(uint256 offset, uint256 limit) → Market[]
getBet(uint256 marketId, address bettor) → Bet
getMarketCount() → uint256
```

### Enums & Fee Structure

```
MarketStatus: Active | Resolved | Cancelled
Outcome:      None | Yes | No

Fees: 1% platform (owner) + 2% creator + 97% winners (proportional stake)
MIN_BET = 0.001 AVAX  |  MIN_CREATION_BOND = 0.01 AVAX (= creator's YES bet)
MIN_DURATION = 5 min  |  MAX_DURATION = 30 days
```

### Foundry Setup

The reference uses Hardhat — ignore that, use Foundry instead. Create `contracts/` as a Foundry project:

```bash
forge init contracts
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
```

`foundry.toml`:
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.25"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
fuji = "https://api.avax-test.network/ext/bc/C/rpc"

[etherscan]
fuji = { key = "verifyContract", url = "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan/api" }
```

Deploy script (`script/Deploy.s.sol`):
```solidity
contract DeployScript is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("DEPLOYER_KEY"));
        PulseMarket market = new PulseMarket(msg.sender);
        console.log("PulseMarket:", address(market));
        vm.stopBroadcast();
    }
}
```

`contracts/.env`:
```env
DEPLOYER_KEY=0x...
FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
```

---

## Frontend: What to Adapt

### Key reference files (from `resources/Pulse-Prediction-Market/frontend/src/`)

| Reference file | Adapt to | Notes |
|---|---|---|
| `lib/wagmi.ts` | `lib/wagmi.ts` | Replace `somniaTestnet` + RainbowKit with Privy + Fuji chain |
| `lib/contracts/abis.ts` | `lib/contracts/abis.ts` | Update ABI to match simplified `createMarket`; remove `SomniaEventHandler` ABI |
| `lib/contracts/addresses.ts` | `lib/contracts/addresses.ts` | Add Fuji chainId `43113` |
| `hooks/usePulseMarket.ts` | `hooks/use-pulse-market.ts` | Port `useMarket`, `useMarkets`, `useMarketCount`, `useUserBet` — logic unchanged |
| `hooks/useMarketActions.ts` | `hooks/use-market-actions.ts` | Port `usePlaceBet`, `useClaimWinnings`, `useClaimRefund`; simplify `useCreateMarket`; **drop** `useSubscribeMarket`; **add** `useResolveMarket` |
| `components/market/MarketCard.tsx` | `components/markets/market-card.tsx` | Adapt UI |
| `components/market/MarketDetail.tsx` | `components/markets/market-detail.tsx` | Adapt UI |
| `components/market/CreateMarketModal.tsx` | `components/markets/create-market-modal.tsx` | Simplify form (remove reactive fields) |
| `types/index.ts` | `types/index.ts` | Copy structs, update `Market` to remove reactive fields |

### Wallet Setup

Use **Privy** (not RainbowKit) — reference: `resources/pulse-markets/components/providers/privy-provider.tsx` and `lib/wagmi-config.ts`.

Define Fuji chain with `defineChain` from viem:
```ts
export const avalancheFuji = defineChain({
  id: 43113,
  name: "Avalanche Fuji",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: { default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] } },
  blockExplorers: { default: { name: "Snowtrace", url: "https://testnet.snowtrace.io" } },
  testnet: true,
})
```

---

## Network: Avalanche Fuji Testnet

| | |
|---|---|
| RPC | `https://api.avax-test.network/ext/bc/C/rpc` |
| Chain ID | `43113` |
| Currency | AVAX |
| Explorer | https://testnet.snowtrace.io |
| Faucet | https://faucet.avax.network |

---

## Environment Variables

`.env.local` in `frontend/`:
```env
NEXT_PUBLIC_PRIVY_APP_ID=         # Privy dashboard
NEXT_PUBLIC_CONTRACT_ADDRESS=     # Deployed PulseMarket on Fuji
```

`.env` in `contracts/`:
```env
DEPLOYER_PRIVATE_KEY=0x...        # Fuji deployer wallet
```

---

## Avalanche MCP

Installed. Use to look up Fuji RPC details, C-Chain deployment, wagmi integration:
```
mcp__avalanche-docs__docs_search
mcp__avalanche-docs__blockchain_get_contract_info
mcp__avalanche-docs__blockchain_lookup_chain
```

---

## What Was Dropped (Somnia-specific, not needed)

- `SomniaEventHandler.sol` and `IReactiveContract.sol` — reactive settlement system
- `onlyEventHandler` modifier and `setEventHandler` / `eventHandler` state
- `watchedContract`, `eventTopic`, `conditionData` in `createMarket`
- `useSubscribeMarket` hook
- `encodeCondition` utility
- Somnia Explorer verification config
