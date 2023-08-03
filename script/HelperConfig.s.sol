// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract HelperConfig {
    struct NetworkConfig {
        address authorizedSigner;
    }

    NetworkConfig public s_activeNetworkConfig;

    constructor() {
        if (block.chainid == 31337) {
            s_activeNetworkConfig = getOrCreateAnvilConfig();
        } else {
            s_activeNetworkConfig = getSepoliaConfig();
        }
    }

    function getActiveConfig() public view returns (NetworkConfig memory) {
        return s_activeNetworkConfig;
    }

    function getOrCreateAnvilConfig()
        internal
        pure
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                authorizedSigner: address(
                    0x1C6C09E3dfd587DC3D9087254412c6a811759345
                )
            });
    }

    function getSepoliaConfig() internal pure returns (NetworkConfig memory) {
        return
            NetworkConfig({
                authorizedSigner: address(
                    0x1C6C09E3dfd587DC3D9087254412c6a811759345
                )
            });
    }
}
