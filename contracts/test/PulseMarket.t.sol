// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {Test} from "forge-std/Test.sol";
import {PulseMarket} from "../src/PulseMarket.sol";
import {IPulseMarket} from "../src/interfaces/IPulseMarket.sol";

contract PulseMarketTest is Test {
    PulseMarket public market;

    address public owner   = makeAddr("owner");
    address public creator = makeAddr("creator");
    address public bettor1 = makeAddr("bettor1");
    address public bettor2 = makeAddr("bettor2");

    uint256 constant CREATION_BOND = 0.01 ether;
    uint256 constant MIN_BET       = 0.001 ether;
    uint256 constant ONE_DAY       = 1 days;

    function setUp() public {
        market = new PulseMarket(owner);
        vm.deal(creator, 10 ether);
        vm.deal(bettor1, 10 ether);
        vm.deal(bettor2, 10 ether);
    }

    // ─── createMarket ─────────────────────────────────────────────────────────

    function test_createMarket_success() public {
        vm.prank(creator);
        uint256 id = market.createMarket{value: CREATION_BOND}("Will ETH hit $10k?", ONE_DAY);

        assertEq(id, 0);
        assertEq(market.getMarketCount(), 1);

        IPulseMarket.Market memory m = market.getMarket(0);
        assertEq(m.creator, creator);
        assertEq(m.question, "Will ETH hit $10k?");
        assertEq(m.totalYesBets, CREATION_BOND);
        assertEq(uint8(m.status), uint8(IPulseMarket.MarketStatus.Active));
    }

    function test_createMarket_revertsOnEmptyQuestion() public {
        vm.prank(creator);
        vm.expectRevert(PulseMarket.EmptyQuestion.selector);
        market.createMarket{value: CREATION_BOND}("", ONE_DAY);
    }

    function test_createMarket_revertsOnInsufficientBond() public {
        vm.prank(creator);
        vm.expectRevert(PulseMarket.InsufficientCreationBond.selector);
        market.createMarket{value: 0.005 ether}("Will ETH pump?", ONE_DAY);
    }

    function test_createMarket_revertsOnDurationTooShort() public {
        vm.prank(creator);
        vm.expectRevert(PulseMarket.DurationTooShort.selector);
        market.createMarket{value: CREATION_BOND}("Will ETH pump?", 1 minutes);
    }

    // ─── placeBet ─────────────────────────────────────────────────────────────

    function test_placeBet_success() public {
        vm.prank(creator);
        market.createMarket{value: CREATION_BOND}("Will AVAX pump?", ONE_DAY);

        vm.prank(bettor1);
        market.placeBet{value: 0.1 ether}(0, false);

        IPulseMarket.Bet memory b = market.getBet(0, bettor1);
        assertEq(b.amount, 0.1 ether);
        assertFalse(b.isYes);
    }

    function test_placeBet_revertsOnDuplicateBet() public {
        vm.prank(creator);
        market.createMarket{value: CREATION_BOND}("Will AVAX pump?", ONE_DAY);

        vm.prank(bettor1);
        market.placeBet{value: MIN_BET}(0, true);

        vm.prank(bettor1);
        vm.expectRevert(PulseMarket.AlreadyBet.selector);
        market.placeBet{value: MIN_BET}(0, false);
    }

    function test_placeBet_revertsOnExpiredMarket() public {
        vm.prank(creator);
        market.createMarket{value: CREATION_BOND}("Will AVAX pump?", ONE_DAY);

        vm.warp(block.timestamp + ONE_DAY + 1);

        vm.prank(bettor1);
        vm.expectRevert(PulseMarket.MarketAlreadyExpired.selector);
        market.placeBet{value: MIN_BET}(0, true);
    }

    // ─── resolveMarket ────────────────────────────────────────────────────────

    function test_resolveMarket_yesWins() public {
        vm.prank(creator);
        market.createMarket{value: CREATION_BOND}("Will AVAX pump?", ONE_DAY);

        vm.prank(bettor1);
        market.placeBet{value: 0.1 ether}(0, false);

        vm.prank(owner);
        market.resolveMarket(0, true);

        IPulseMarket.Market memory m = market.getMarket(0);
        assertEq(uint8(m.status), uint8(IPulseMarket.MarketStatus.Resolved));
        assertEq(uint8(m.outcome), uint8(IPulseMarket.Outcome.Yes));
    }

    function test_resolveMarket_revertsIfNotOwner() public {
        vm.prank(creator);
        market.createMarket{value: CREATION_BOND}("Will AVAX pump?", ONE_DAY);

        vm.prank(bettor1);
        vm.expectRevert();
        market.resolveMarket(0, true);
    }

    function test_resolveMarket_revertsIfExpired() public {
        vm.prank(creator);
        market.createMarket{value: CREATION_BOND}("Will AVAX pump?", ONE_DAY);

        vm.warp(block.timestamp + ONE_DAY + 1);

        vm.prank(owner);
        vm.expectRevert(PulseMarket.MarketAlreadyExpired.selector);
        market.resolveMarket(0, true);
    }

    // ─── claimWinnings ────────────────────────────────────────────────────────

    function test_claimWinnings_winner() public {
        vm.prank(creator);
        market.createMarket{value: CREATION_BOND}("Will AVAX pump?", ONE_DAY);

        vm.prank(bettor1);
        market.placeBet{value: 1 ether}(0, false);

        vm.prank(owner);
        market.resolveMarket(0, false); // NO wins

        uint256 balanceBefore = bettor1.balance;
        vm.prank(bettor1);
        market.claimWinnings(0);

        assertGt(bettor1.balance, balanceBefore);
    }

    function test_claimWinnings_revertsIfNotWinner() public {
        vm.prank(creator);
        market.createMarket{value: CREATION_BOND}("Will AVAX pump?", ONE_DAY);

        vm.prank(bettor1);
        market.placeBet{value: 1 ether}(0, true); // bet YES

        vm.prank(owner);
        market.resolveMarket(0, false); // NO wins → bettor1 loses

        vm.prank(bettor1);
        vm.expectRevert(PulseMarket.NotAWinner.selector);
        market.claimWinnings(0);
    }

    // ─── cancelExpiredMarket + claimRefund ────────────────────────────────────

    function test_cancelAndRefund() public {
        vm.prank(creator);
        market.createMarket{value: CREATION_BOND}("Will AVAX pump?", ONE_DAY);

        vm.prank(bettor1);
        market.placeBet{value: 0.5 ether}(0, true);

        vm.warp(block.timestamp + ONE_DAY + 1);

        market.cancelExpiredMarket(0);

        IPulseMarket.Market memory m = market.getMarket(0);
        assertEq(uint8(m.status), uint8(IPulseMarket.MarketStatus.Cancelled));

        uint256 balanceBefore = bettor1.balance;
        vm.prank(bettor1);
        market.claimRefund(0);
        assertEq(bettor1.balance, balanceBefore + 0.5 ether);
    }

    // ─── withdrawPlatformFees ─────────────────────────────────────────────────

    function test_withdrawPlatformFees() public {
        vm.prank(creator);
        market.createMarket{value: CREATION_BOND}("Will AVAX pump?", ONE_DAY);

        vm.prank(bettor1);
        market.placeBet{value: 1 ether}(0, false);

        vm.prank(owner);
        market.resolveMarket(0, false);

        vm.prank(bettor1);
        market.claimWinnings(0);

        uint256 ownerBefore = owner.balance;
        vm.prank(owner);
        market.withdrawPlatformFees();
        assertGt(owner.balance, ownerBefore);
    }

    // ─── getMarkets (pagination) ──────────────────────────────────────────────

    function test_getMarkets_pagination() public {
        for (uint256 i = 0; i < 3; i++) {
            vm.prank(creator);
            market.createMarket{value: CREATION_BOND}("Question", ONE_DAY);
        }

        IPulseMarket.Market[] memory page = market.getMarkets(1, 2);
        assertEq(page.length, 2);
        assertEq(page[0].id, 1);
        assertEq(page[1].id, 2);
    }
}
