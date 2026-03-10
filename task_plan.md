# Task Plan: PulseMarkets — Submission Checklist

## Goal
Ship a fully working Avalanche prediction market dApp, ready for Avalanche Build Games Stage 2 submission.

## Status: In Progress

---

## Completed (by this session)

- [x] **Contracts**: Foundry project scaffolded, PulseMarket.sol adapted from Somnia → Fuji
- [x] **Contracts**: 15 unit tests passing (forge test)
- [x] **Contracts**: Deployed to Avalanche Fuji — `0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21`
- [x] **Frontend**: ABI + addresses wired to deployed contract
- [x] **Frontend**: wagmi hooks — `useMarket`, `useMarkets`, `useMarketCount`, `useUserBet`
- [x] **Frontend**: action hooks — `usePlaceBet`, `useCreateMarket`, `useResolveMarket`, `useClaimWinnings`, `useClaimRefund`
- [x] **Frontend**: Privy + wagmi wallet integration (Fuji chain, embedded + external)
- [x] **Frontend**: AppNavbar with wallet connect
- [x] **Frontend**: Markets feed page (`/markets`) — filter tabs, paginated grid, AnimatePresence
- [x] **Frontend**: Market detail page (`/markets/[id]`) — pool stats, bet interface, owner resolve panel
- [x] **Frontend**: BetInterface — place bet, claim winnings, claim refund, cancel expired
- [x] **Frontend**: CreateMarketModal — simplified (question + duration only)
- [x] **Frontend**: MarketCard — live countdown, YES/NO split, pool size
- [x] **Frontend**: TypeScript clean (`tsc --noEmit` passes)
- [x] **Frontend**: Production build passes (5 routes, no errors)
- [x] **Docs**: Contract address filled in README.md + technical-docs.md
- [x] **Docs**: Snowtrace explorer links added

---

## Remaining (YOU need to do these)

- [ ] **Privy App ID**: Go to https://privy.io → create app → copy App ID → paste into `frontend/.env.local`:
  ```
  NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxxx
  NEXT_PUBLIC_CONTRACT_ADDRESS=0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21
  ```

- [ ] **Deploy to Vercel**:
  ```bash
  cd frontend
  vercel --prod
  # Set env vars in Vercel dashboard:
  #   NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-id>
  #   NEXT_PUBLIC_CONTRACT_ADDRESS=0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21
  ```
  Then update README.md and docs/technical-docs.md `[ADD AFTER DEPLOYMENT]` links with live URL.

- [ ] **Record video demo** (screen record the full user flow):
  1. Land on home page
  2. Connect wallet via Privy
  3. Browse markets feed
  4. Create a market (admin wallet)
  5. Place a bet (YES and/or NO)
  6. Resolve a market (admin wallet)
  7. Claim winnings
  Then update docs/technical-docs.md `[ADD AFTER RECORDING]` with the video URL.

- [ ] **Submit** to Avalanche Build Games with:
  - GitHub repo URL
  - Live demo URL (Vercel)
  - Video demo URL
  - Contract address: `0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21`
  - Snowtrace: https://testnet.snowtrace.io/address/0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21

---

## Optional Polish (time permitting)

- [ ] Verify contract on Routescan/Snowtrace:
  ```bash
  cd contracts
  forge verify-contract 0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21 \
    src/PulseMarket.sol:PulseMarket \
    --chain 43113 \
    --verifier-url https://api.routescan.io/v2/network/testnet/evm/43113/etherscan/api \
    --etherscan-api-key verifyContract
  ```

- [ ] Create 2-3 demo markets on the deployed contract (admin wallet) so the feed isn't empty for judges

---

## Key Info

| | |
|---|---|
| Contract | `0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21` |
| Snowtrace | https://testnet.snowtrace.io/address/0xF5875F25ccEB2edDc57F218eaF1F71c5CF161f21 |
| Chain | Avalanche Fuji (43113) |
| Faucet | https://faucet.avax.network |
| Min bet | 0.001 AVAX |
| Creation bond | 0.01 AVAX |
