// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

contract CoolNFT is ERC721 {
    using Counters for Counters.Counter;

    error CoolNFT_NotValidSignature();

    using ECDSA for bytes32;

    string[] private s_tokenIpfsHash;
    Counters.Counter private s_tokenCounter;

    address private s_authorizedSigner;

    constructor(address _authorizedSigner) ERC721("CoolNFT", "Cool") {
        s_tokenIpfsHash = new string[](0);
        s_authorizedSigner = _authorizedSigner;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        _requireMinted(_tokenId);
        return string(abi.encodePacked(_baseURI(), s_tokenIpfsHash[_tokenId]));
    }

    function mint(string memory _ipfsHash, bytes memory _signature) external {
        address signer = keccak256(abi.encodePacked(_ipfsHash)).toEthSignedMessageHash().recover(_signature);
        if (signer == address(0) || signer != s_authorizedSigner) {
            revert CoolNFT_NotValidSignature();
        }
        _safeMint(msg.sender, s_tokenCounter.current());
        s_tokenIpfsHash.push(_ipfsHash);
        s_tokenCounter.increment();
    }
}
