// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CoolNFT is ERC721 {
    error CoolNFT_NotValidSignature();
    using ECDSA for bytes32;

    string[] private s_tokenIpfsHash;
    uint256 private s_tokenCounter;

    address private s_authorizedSigner;

    constructor(address _authorizedSigner) ERC721("CoolNFT", "Cool") {
        s_tokenCounter = 0;
        s_tokenIpfsHash = new string[](0);
        s_authorizedSigner = _authorizedSigner;
    }

    function _baseURI() internal view override returns (string memory) {
        return "ipfs://";
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI(), s_tokenIpfsHash[_tokenId]));
    }

    function mint(string memory _ipfsHash, bytes memory _signature) external {
        address signer = keccak256(abi.encodePacked(_ipfsHash))
            .toEthSignedMessageHash()
            .recover(_signature);
        if (signer == address(0) || signer != s_authorizedSigner) {
            revert CoolNFT_NotValidSignature();
        }

        _safeMint(msg.sender, s_tokenCounter);
        s_tokenIpfsHash.push(_ipfsHash);
        s_tokenCounter++;
    }
}
