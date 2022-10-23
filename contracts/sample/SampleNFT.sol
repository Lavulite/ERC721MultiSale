// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/ERC721A.sol";

contract SampleNFT is ERC721A, Ownable, AccessControl {
    bytes32 public MINTER = "MINTER";
    bytes32 public BURNER = "BURNER";

    constructor()
        ERC721A("SampleNFT", "SampleNFT")
    {
        _setRoleAdmin(MINTER, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(BURNER, DEFAULT_ADMIN_ROLE);
    }

    function mint(address to, uint256 amount)
        external
        payable
        onlyRole(MINTER)
    {
        _safeMint(to, amount);
    }

    function burn(address holder, uint256[] calldata burnTokenIds)
        external
        payable
        onlyRole(BURNER)
    {
        for (uint256 i = 0; i < burnTokenIds.length; i++) {
            uint256 tokenId = burnTokenIds[i];
            require(holder == ownerOf(tokenId), "only holder.");
            _burn(tokenId);
        }
    }

    function totalBurned() external view returns (uint256) {
        return _totalBurned();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC721A)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function grantRole(bytes32 role, address account) override public onlyOwner {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) override public onlyOwner {
        _revokeRole(role, account);
    }
}
