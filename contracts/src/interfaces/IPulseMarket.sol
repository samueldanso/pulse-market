// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

/// @title IPulseMarket
/// @notice Public interface for the PulseMarket core contract on Avalanche Fuji.
interface IPulseMarket {
    // ─── Enums ───────────────────────────────────────────────────────────────

    enum MarketStatus {
        Active,
        Resolved,
        Cancelled
    }

    enum Outcome {
        None, // Market not yet resolved
        Yes,  // Condition was TRUE
        No    // Condition was FALSE
    }

    // ─── Structs ─────────────────────────────────────────────────────────────

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

    // ─── Events ──────────────────────────────────────────────────────────────

    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string          question,
        uint256         endTime
    );

    event BetPlaced(
        uint256 indexed marketId,
        address indexed bettor,
        bool    indexed isYes,
        uint256         amount
    );

    event MarketResolved(
        uint256 indexed marketId,
        Outcome indexed outcome,
        uint256         totalYesBets,
        uint256         totalNoBets
    );

    event MarketCancelled(uint256 indexed marketId, string reason);

    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed bettor,
        uint256         amount
    );

    event CreatorFeeWithdrawn(
        uint256 indexed marketId,
        address indexed creator,
        uint256         amount
    );

    // ─── Core Functions ───────────────────────────────────────────────────────

    /// @notice Create a new prediction market.
    /// @param question The yes/no question for the market.
    /// @param duration Duration in seconds before the market expires.
    /// @return marketId The ID of the newly created market.
    function createMarket(string calldata question, uint256 duration)
        external
        payable
        returns (uint256 marketId);

    /// @notice Place a bet on a market.
    /// @param marketId The market to bet on.
    /// @param isYes True to bet YES, false to bet NO.
    function placeBet(uint256 marketId, bool isYes) external payable;

    /// @notice Settle a market with an outcome. Only callable by owner.
    /// @param marketId The market to resolve.
    /// @param conditionMet True = YES wins, false = NO wins.
    function resolveMarket(uint256 marketId, bool conditionMet) external;

    /// @notice Claim winnings from a resolved market.
    /// @param marketId The market to claim from.
    function claimWinnings(uint256 marketId) external;

    /// @notice Cancel a market that has expired without resolution.
    /// @param marketId The market to cancel.
    function cancelExpiredMarket(uint256 marketId) external;

    /// @notice Claim refund from a cancelled market.
    /// @param marketId The market to refund from.
    function claimRefund(uint256 marketId) external;

    // ─── Views ────────────────────────────────────────────────────────────────

    function getMarket(uint256 marketId) external view returns (Market memory);

    function getBet(uint256 marketId, address bettor) external view returns (Bet memory);

    function getMarketCount() external view returns (uint256);
}
