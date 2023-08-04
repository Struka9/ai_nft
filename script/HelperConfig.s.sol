// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract HelperConfig {
    struct NetworkConfig {
        address authorizedSigner;
    }

    NetworkConfig public s_activeNetworkConfig;

    address constant ANVIL_DEFAULT_ADDRESS =
        address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);

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
        return NetworkConfig({authorizedSigner: ANVIL_DEFAULT_ADDRESS});
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
