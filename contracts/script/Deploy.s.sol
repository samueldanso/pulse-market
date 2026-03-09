// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {Script, console} from "forge-std/Script.sol";
import {PulseMarket} from "../src/PulseMarket.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("DEPLOYER_KEY"));

        PulseMarket market = new PulseMarket(msg.sender);
        console.log("PulseMarket deployed to:", address(market));

        vm.stopBroadcast();
    }
}
