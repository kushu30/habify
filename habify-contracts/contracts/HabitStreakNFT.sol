// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HabitStreakNFT
 * @dev A soulbound (non-transferable) ERC721 token to reward user streaks.
 * The HabitManager contract will be the owner and sole minter.
 */
contract HabitStreakNFT is ERC721, Ownable {
    string private _baseTokenURI;

    constructor(address initialOwner) ERC721("Habify Streak Badge", "HSB") Ownable(initialOwner) {}

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        // This is the "soulbound" logic. It prevents the token from being transferred.
        require(_ownerOf(tokenId) == address(0), "HabitStreakNFT: Token is non-transferable");
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Allows the owner (the HabitManager contract) to mint a new badge for a user.
     */
    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    /**
     * @dev Sets the base URI for the NFT metadata, which will point to our images.
     */
    function setBaseURI(string calldata baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}