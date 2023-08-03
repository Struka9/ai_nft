// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {CoolNFT} from "../src/CoolNFT.sol";

contract CoolNFTTest is Test {
    // authorized signer's address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    // authorized signer's PK: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    CoolNFT private instance;

    address BOB = makeAddr("bob");

    string TOKEN_URI = "ipfs://QmdHT3ai8PfUsyVAftbFHagCEUYcVRgi4TCyGUJ6rmAVcQ";
    string TOKEN_SAMPLE_HASH = "QmdHT3ai8PfUsyVAftbFHagCEUYcVRgi4TCyGUJ6rmAVcQ";
    bytes TOKEN_SAMPLE_SIGNATURE =
        abi.encodePacked(
            hex"eacd997e039a226b1bdf14fea6ec30301be1c12593e2d74066d60c2458e7d8bf45b976670cfb356bf227338e7e764536988229c926e6c38abf7a83231ec428b21b"
        );
    bytes TOKEN_INVALID_SIGNATURE =
        abi.encodePacked(
            hex"ffff997e039a226b1bdf14fea6ec30301be1c12593e2d74066d60c2458e7d8bf45b976670cfb356bf227338e7e764536988229c926e6c38abf7a83231ec428b21b"
        );

    function setUp() public {
        instance = new CoolNFT(
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
        );
    }

    function testSignerIsCorrect() public {
        vm.prank(BOB);
        instance.mint(TOKEN_SAMPLE_HASH, TOKEN_SAMPLE_SIGNATURE);
    }

    function testIncorrectHashForMint() public {
        vm.prank(BOB);
        vm.expectRevert(CoolNFT.CoolNFT_NotValidSignature.selector);
        instance.mint("some-random-incorrect-hash", TOKEN_SAMPLE_SIGNATURE);
    }

    function testIncorrectSignatureForMint() public {
        vm.prank(BOB);
        vm.expectRevert("ECDSA: invalid signature");
        instance.mint(TOKEN_SAMPLE_HASH, TOKEN_INVALID_SIGNATURE);
    }

    function testTokenUri() public {
        vm.prank(BOB);
        instance.mint(TOKEN_SAMPLE_HASH, TOKEN_SAMPLE_SIGNATURE);
        assertEq(instance.tokenURI(0), TOKEN_URI);
    }
}
