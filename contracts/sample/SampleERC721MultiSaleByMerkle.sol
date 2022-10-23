// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../merkletree/ERC721MultiSaleByMerkle.sol";
import "./SampleNFT.sol";

contract SampleERC721MultiSaleByMerkle is
    ERC721MultiSaleByMerkle,
    AccessControl,
    Ownable
{
    bytes32 public ADMIN = "ADMIN";
    SampleNFT _nft;

    constructor(address nft) {
        _nft = SampleNFT(nft);
        _setRoleAdmin(ADMIN, DEFAULT_ADMIN_ROLE);
        _grantRole(ADMIN, msg.sender);
    }

    // ==================================================================
    // override ERC721MultiSaleByMerkle
    // ==================================================================
    function claim(
        uint256 amount,
        uint256 allowedAmount,
        bytes32[] calldata merkleProof
    ) external payable enoughEth(amount) {
        _claim(amount, allowedAmount, merkleProof);
        _nft.mint(msg.sender, amount);
    }

    function exchange(
        uint256[] calldata burnTokenIds,
        uint256 allowedAmount,
        bytes32[] calldata merkleProof
    ) external payable enoughEth(burnTokenIds.length) {
        _exchange(burnTokenIds, allowedAmount, merkleProof);
        _nft.burn(msg.sender, burnTokenIds);
        _nft.mint(msg.sender, burnTokenIds.length);
    }

    function setCurrentSale(Sale calldata sale, bytes32 merkleRoot)
        external
        onlyRole(ADMIN)
    {
        _setCurrentSale(sale);
        _merkleRoot = merkleRoot;
    }

    // ==================================================================
    // override ERC721MultiSale
    // ==================================================================
    function pause() external onlyRole(ADMIN) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN) {
        _unpause();
    }

    function setWithdrawAddress(address payable withdrawAddress)
        external
        onlyRole(ADMIN)
    {
        _withdrawAddress = withdrawAddress;
    }

    // ==================================================================
    // operations
    // ==================================================================
    function grantRole(bytes32 role, address account)
        public
        override
        onlyOwner
    {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account)
        public
        override
        onlyOwner
    {
        _revokeRole(role, account);
    }
}
