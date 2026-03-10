export const PULSE_MARKET_ABI = [
  // ── Events ──
  {
    type: "event",
    name: "MarketCreated",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true  },
      { name: "creator",  type: "address", indexed: true  },
      { name: "question", type: "string",  indexed: false },
      { name: "endTime",  type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BetPlaced",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true  },
      { name: "bettor",   type: "address", indexed: true  },
      { name: "isYes",    type: "bool",    indexed: true  },
      { name: "amount",   type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MarketResolved",
    inputs: [
      { name: "marketId",     type: "uint256", indexed: true  },
      { name: "outcome",      type: "uint8",   indexed: true  },
      { name: "totalYesBets", type: "uint256", indexed: false },
      { name: "totalNoBets",  type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MarketCancelled",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true  },
      { name: "reason",   type: "string",  indexed: false },
    ],
  },
  {
    type: "event",
    name: "WinningsClaimed",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true  },
      { name: "bettor",   type: "address", indexed: true  },
      { name: "amount",   type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CreatorFeeWithdrawn",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true  },
      { name: "creator",  type: "address", indexed: true  },
      { name: "amount",   type: "uint256", indexed: false },
    ],
  },
  // ── Write Functions ──
  {
    type: "function",
    name: "createMarket",
    stateMutability: "payable",
    inputs: [
      { name: "question", type: "string"  },
      { name: "duration", type: "uint256" },
    ],
    outputs: [{ name: "marketId", type: "uint256" }],
  },
  {
    type: "function",
    name: "placeBet",
    stateMutability: "payable",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "isYes",    type: "bool"    },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "resolveMarket",
    stateMutability: "nonpayable",
    inputs: [
      { name: "marketId",     type: "uint256" },
      { name: "conditionMet", type: "bool"    },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claimWinnings",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claimRefund",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelExpiredMarket",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawCreatorFee",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawPlatformFees",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  // ── Read Functions ──
  {
    type: "function",
    name: "getMarket",
    stateMutability: "view",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id",                  type: "uint256" },
          { name: "creator",             type: "address" },
          { name: "question",            type: "string"  },
          { name: "endTime",             type: "uint256" },
          { name: "totalYesBets",        type: "uint256" },
          { name: "totalNoBets",         type: "uint256" },
          { name: "status",              type: "uint8"   },
          { name: "outcome",             type: "uint8"   },
          { name: "createdAt",           type: "uint256" },
          { name: "resolvedAt",          type: "uint256" },
          { name: "creatorFeeCollected", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getMarkets",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit",  type: "uint256" },
    ],
    outputs: [
      {
        name: "markets",
        type: "tuple[]",
        components: [
          { name: "id",                  type: "uint256" },
          { name: "creator",             type: "address" },
          { name: "question",            type: "string"  },
          { name: "endTime",             type: "uint256" },
          { name: "totalYesBets",        type: "uint256" },
          { name: "totalNoBets",         type: "uint256" },
          { name: "status",              type: "uint8"   },
          { name: "outcome",             type: "uint8"   },
          { name: "createdAt",           type: "uint256" },
          { name: "resolvedAt",          type: "uint256" },
          { name: "creatorFeeCollected", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getBet",
    stateMutability: "view",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "bettor",   type: "address" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "bettor",   type: "address" },
          { name: "marketId", type: "uint256" },
          { name: "isYes",    type: "bool"    },
          { name: "amount",   type: "uint256" },
          { name: "claimed",  type: "bool"    },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getMarketCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "platformFeeBalance",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
