// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../signature/ERC721MultiSaleBySignature.sol";
import "../../mock/SampleNFT.sol";

contract SampleERC721MultiSaleBySignature is
    ERC721MultiSaleBySignature,
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
    // override ERC721MultiSaleBySignature
    // ==================================================================
    function claim(
        uint248 amount,
        uint248 allowedAmount,
        bytes calldata signature
    ) external payable enoughEth(amount) {
        _claim(amount, allowedAmount, signature);
        _nft.mint(msg.sender, amount);
    }

    function exchange(
        uint256[] calldata burnTokenIds,
        uint248 allowedAmount,
        bytes calldata signature
    ) external payable enoughEth(burnTokenIds.length) {
        _exchange(burnTokenIds, allowedAmount, signature);
        _nft.burn(msg.sender, burnTokenIds);
        _nft.mint(msg.sender, burnTokenIds.length);
    }

    // ==================================================================
    // override ERC721MultiSale
    // ==================================================================
    function setCurrentSale(Sale calldata sale) external onlyRole(ADMIN) {
        _setCurrentSale(sale);
    }

    function pause() external onlyRole(ADMIN) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN) {
        _unpause();
    }

    function withdraw() external payable onlyRole(ADMIN) {
        _withdraw();
    }
    
    function setWithdrawAddress(address payable value)
        external
        onlyRole(ADMIN)
    {
        withdrawAddress = value;
    }

    function setMaxSupply(uint256 value) external onlyRole(ADMIN) {
        maxSupply = value;
    }

    function _totalSupply() internal view override returns (uint256) {
        return _nft.totalSupply();
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

    function setSigner(address signer) external onlyRole(ADMIN) {
        _signer = signer;
    }
}
