export const FUJI_CHAIN_ID   = 43113;
export const FUJI_EXPLORER   = "https://testnet.snowtrace.io";
export const FUJI_RPC        = "https://api.avax-test.network/ext/bc/C/rpc";
export const FUJI_FAUCET     = "https://faucet.avax.network";

export const MIN_BET_ETH       = "0.001";  // AVAX
export const CREATION_BOND_ETH = "0.01";   // AVAX
export const PLATFORM_FEE_BPS  = 100;      // 1%
export const CREATOR_FEE_BPS   = 200;      // 2%

export const DURATION_OPTIONS = [
  { label: "5 minutes", value: 300     },
  { label: "1 hour",    value: 3_600   },
  { label: "6 hours",   value: 21_600  },
  { label: "1 day",     value: 86_400  },
  { label: "3 days",    value: 259_200 },
  { label: "7 days",    value: 604_800 },
  { label: "30 days",   value: 2_592_000 },
] as const;
