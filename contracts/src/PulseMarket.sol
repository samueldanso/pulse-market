// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IPulseMarket} from "./interfaces/IPulseMarket.sol";

/// @title PulseMarket
/// @notice Core prediction market contract for PulseMarket on Avalanche Fuji Testnet.
///
///         Fee structure:
///           - 1% platform fee (to owner)
///           - 2% creator fee (to market creator)
///           - 97% to winning bettors (proportional to stake)
///
///         A minimum bet of 0.001 AVAX prevents dust attacks.
///         A minimum creation bond of 0.01 AVAX is required to create a market.
///         The creation bond counts as the creator's YES bet.
contract PulseMarket is IPulseMarket, ReentrancyGuard, Ownable2Step, Pausable {
    // ─── Constants ───────────────────────────────────────────────────────────

    uint256 public constant PLATFORM_FEE_BPS   = 100;    // 1%
    uint256 public constant CREATOR_FEE_BPS    = 200;    // 2%
    uint256 public constant BPS_DENOMINATOR    = 10_000;
    uint256 public constant MIN_BET            = 0.001 ether;
    uint256 public constant MIN_CREATION_BOND  = 0.01 ether;
    uint256 public constant MIN_DURATION       = 5 minutes;
    uint256 public constant MAX_DURATION       = 30 days;
    uint256 public constant MAX_QUESTION_LEN   = 280;

    // ─── Custom Errors ────────────────────────────────────────────────────────

    error EmptyQuestion();
    error QuestionTooLong();
    error DurationTooShort();
    error DurationTooLong();
    error InsufficientCreationBond();
    error MarketDoesNotExist();
    error MarketNotActive();
    error MarketAlreadyExpired();
    error MarketNotExpired();
    error MarketNotResolved();
    error MarketNotCancelled();
    error BetBelowMinimum();
    error AlreadyBet();
    error NoBet();
    error AlreadyClaimed();
    error NotAWinner();
    error NotCreator();
    error NoCreatorFee();
    error NoPlatformFees();
    error TransferFailed();

    // ─── State ────────────────────────────────────────────────────────────────

    uint256 private _marketCounter;

    /// @notice Accumulated platform fees available to withdraw.
    uint256 public platformFeeBalance;

    mapping(uint256 => Market) private _markets;
    /// @dev marketId => bettor => Bet
    mapping(uint256 => mapping(address => Bet)) private _bets;
    /// @dev marketId => list of bettors (for iteration in cancel/refund)
    mapping(uint256 => address[]) private _bettors;

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier marketExists(uint256 marketId) {
        _checkMarketExists(marketId);
        _;
    }

    modifier marketActive(uint256 marketId) {
        _checkMarketActive(marketId);
        _;
    }

    function _checkMarketExists(uint256 marketId) internal view {
        if (marketId >= _marketCounter) revert MarketDoesNotExist();
    }

    function _checkMarketActive(uint256 marketId) internal view {
        if (_markets[marketId].status != MarketStatus.Active) revert MarketNotActive();
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address initialOwner) Ownable(initialOwner) {}

    // ─── Admin ────────────────────────────────────────────────────────────────

    /// @notice Pause the contract. Halts market creation and betting.
    function pause() external onlyOwner { _pause(); }

    /// @notice Unpause the contract.
    function unpause() external onlyOwner { _unpause(); }

    /// @notice Withdraw accumulated platform fees to the owner.
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 amount = platformFeeBalance;
        if (amount == 0) revert NoPlatformFees();

        // Effects
        platformFeeBalance = 0;

        // Interactions
        _transfer(owner(), amount);
    }

    // ─── Market Lifecycle ─────────────────────────────────────────────────────

    /// @inheritdoc IPulseMarket
    function createMarket(string calldata question, uint256 duration)
        external
        payable
        override
        whenNotPaused
        nonReentrant
        returns (uint256 marketId)
    {
        // Checks
        if (bytes(question).length == 0) revert EmptyQuestion();
        if (bytes(question).length > MAX_QUESTION_LEN) revert QuestionTooLong();
        if (duration < MIN_DURATION) revert DurationTooShort();
        if (duration > MAX_DURATION) revert DurationTooLong();
        if (msg.value < MIN_CREATION_BOND) revert InsufficientCreationBond();

        // Effects
        marketId = _marketCounter++;

        _markets[marketId] = Market({
            id:                  marketId,
            creator:             msg.sender,
            question:            question,
            endTime:             block.timestamp + duration,
            totalYesBets:        0,
            totalNoBets:         0,
            status:              MarketStatus.Active,
            outcome:             Outcome.None,
            createdAt:           block.timestamp,
            resolvedAt:          0,
            creatorFeeCollected: 0
        });

        // Creation bond counts as the creator's YES bet (signals conviction)
        _recordBet(marketId, msg.sender, true, msg.value);

        emit MarketCreated(marketId, msg.sender, question, block.timestamp + duration);
    }

    /// @inheritdoc IPulseMarket
    function placeBet(uint256 marketId, bool isYes)
        external
        payable
        override
        whenNotPaused
        nonReentrant
        marketExists(marketId)
        marketActive(marketId)
    {
        // Checks
        if (msg.value < MIN_BET) revert BetBelowMinimum();
        if (block.timestamp >= _markets[marketId].endTime) revert MarketAlreadyExpired();
        if (_bets[marketId][msg.sender].amount != 0) revert AlreadyBet();

        // Effects + Interactions (recordBet only updates state)
        _recordBet(marketId, msg.sender, isYes, msg.value);

        emit BetPlaced(marketId, msg.sender, isYes, msg.value);
    }

    // ─── Settlement (owner-controlled) ────────────────────────────────────────

    /// @inheritdoc IPulseMarket
    /// @dev Only the contract owner can resolve markets.
    ///      YES outcome = conditionMet true, NO outcome = conditionMet false.
    function resolveMarket(uint256 marketId, bool conditionMet)
        external
        override
        onlyOwner
        marketExists(marketId)
        marketActive(marketId)
        nonReentrant
    {
        Market storage market = _markets[marketId];
        if (block.timestamp > market.endTime) revert MarketAlreadyExpired();

        // Effects
        market.status     = MarketStatus.Resolved;
        market.outcome    = conditionMet ? Outcome.Yes : Outcome.No;
        market.resolvedAt = block.timestamp;

        emit MarketResolved(marketId, market.outcome, market.totalYesBets, market.totalNoBets);
    }

    // ─── Claims ───────────────────────────────────────────────────────────────

    /// @inheritdoc IPulseMarket
    function claimWinnings(uint256 marketId)
        external
        override
        nonReentrant
        marketExists(marketId)
    {
        Market storage market = _markets[marketId];

        // Checks
        if (market.status != MarketStatus.Resolved) revert MarketNotResolved();

        Bet storage bet = _bets[marketId][msg.sender];
        if (bet.amount == 0) revert NoBet();
        if (bet.claimed) revert AlreadyClaimed();

        bool isWinner = (market.outcome == Outcome.Yes && bet.isYes) ||
                        (market.outcome == Outcome.No  && !bet.isYes);
        if (!isWinner) revert NotAWinner();

        // Effects
        bet.claimed = true;

        uint256 totalPool   = market.totalYesBets + market.totalNoBets;
        uint256 winningPool = market.outcome == Outcome.Yes
            ? market.totalYesBets
            : market.totalNoBets;

        uint256 platformFee = (totalPool * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 creatorFee  = (totalPool * CREATOR_FEE_BPS)  / BPS_DENOMINATOR;
        uint256 netPool     = totalPool - platformFee - creatorFee;

        uint256 winnings = (bet.amount * netPool) / winningPool;

        platformFeeBalance += platformFee;

        if (market.creatorFeeCollected == 0) {
            market.creatorFeeCollected = creatorFee;
        }

        emit WinningsClaimed(marketId, msg.sender, winnings);

        // Interactions
        _transfer(msg.sender, winnings);
    }

    /// @notice Creator withdraws their 2% fee after market resolution.
    /// @param marketId The resolved market.
    function withdrawCreatorFee(uint256 marketId)
        external
        nonReentrant
        marketExists(marketId)
    {
        Market storage market = _markets[marketId];

        // Checks
        if (market.status != MarketStatus.Resolved) revert MarketNotResolved();
        if (market.creator != msg.sender) revert NotCreator();

        uint256 fee = market.creatorFeeCollected;
        if (fee == 0) revert NoCreatorFee();

        // Effects
        market.creatorFeeCollected = 0;

        emit CreatorFeeWithdrawn(marketId, msg.sender, fee);

        // Interactions
        _transfer(msg.sender, fee);
    }

    /// @inheritdoc IPulseMarket
    function cancelExpiredMarket(uint256 marketId)
        external
        override
        nonReentrant
        marketExists(marketId)
        marketActive(marketId)
    {
        Market storage market = _markets[marketId];
        if (block.timestamp <= market.endTime) revert MarketNotExpired();

        // Effects
        market.status = MarketStatus.Cancelled;

        emit MarketCancelled(marketId, "Market expired without resolution");
    }

    /// @inheritdoc IPulseMarket
    function claimRefund(uint256 marketId)
        external
        override
        nonReentrant
        marketExists(marketId)
    {
        // Checks
        if (_markets[marketId].status != MarketStatus.Cancelled) revert MarketNotCancelled();

        Bet storage bet = _bets[marketId][msg.sender];
        if (bet.amount == 0) revert NoBet();
        if (bet.claimed) revert AlreadyClaimed();

        // Effects
        bet.claimed = true;
        uint256 refund = bet.amount;

        // Interactions
        _transfer(msg.sender, refund);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /// @inheritdoc IPulseMarket
    function getMarket(uint256 marketId)
        external
        view
        override
        marketExists(marketId)
        returns (Market memory)
    {
        return _markets[marketId];
    }

    /// @inheritdoc IPulseMarket
    function getBet(uint256 marketId, address bettor)
        external
        view
        override
        returns (Bet memory)
    {
        return _bets[marketId][bettor];
    }

    /// @inheritdoc IPulseMarket
    function getMarketCount() external view override returns (uint256) {
        return _marketCounter;
    }

    /// @notice Returns a paginated list of markets.
    /// @param offset Start index.
    /// @param limit  Max number of markets to return.
    function getMarkets(uint256 offset, uint256 limit)
        external
        view
        returns (Market[] memory markets)
    {
        uint256 total = _marketCounter;
        if (offset >= total) return new Market[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 count = end - offset;

        markets = new Market[](count);
        for (uint256 i = 0; i < count; i++) {
            markets[i] = _markets[offset + i];
        }
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    function _recordBet(uint256 marketId, address bettor, bool isYes, uint256 amount) internal {
        Market storage market = _markets[marketId];

        _bets[marketId][bettor] = Bet({
            bettor:   bettor,
            marketId: marketId,
            isYes:    isYes,
            amount:   amount,
            claimed:  false
        });

        _bettors[marketId].push(bettor);

        if (isYes) {
            market.totalYesBets += amount;
        } else {
            market.totalNoBets += amount;
        }
    }

    function _transfer(address to, uint256 amount) internal {
        (bool ok,) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    receive() external payable {}
}
