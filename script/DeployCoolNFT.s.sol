// SPDX-License-Identifier
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {CoolNFT} from "../src/CoolNFT.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployCoolNFT is Script {
    function run() external returns (CoolNFT) {
        HelperConfig helperConfig = new HelperConfig();
        address authorizedSigner = helperConfig
            .getActiveConfig()
            .authorizedSigner;
        vm.startBroadcast();
        CoolNFT instance = new CoolNFT({_authorizedSigner: authorizedSigner});
        vm.stopBroadcast();
        return instance;
    }
}
