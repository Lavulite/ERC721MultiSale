// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./IERC721MultiSaleBySignature.sol";
import "../ERC721MultiSale.sol";

abstract contract ERC721MultiSaleBySignature is
    IERC721MultiSaleBySignature,
    ERC721MultiSale
{
    using ECDSA for bytes32;
    address internal _signer;

    // ==================================================================
    // Modifier
    // ==================================================================
    modifier hasRight(
        uint248 amount,
        uint248 allowedAmount,
        bytes calldata signature
    ) {
        require(
            keccak256(abi.encodePacked(_currentSale.id, msg.sender, allowedAmount))
                .toEthSignedMessageHash()
                .recover(signature) == _signer,
            "invalid proof."
        );
        _;
    }

    // ==================================================================
    // Function
    // ==================================================================
    function _claim(
        uint248 amount,
        uint248 allowedAmount,
        bytes calldata signature
    ) internal virtual hasRight(amount, allowedAmount, signature) {
        _claim(amount, allowedAmount);
    }

    function _exchange(
        uint256[] calldata burnTokenIds,
        uint248 allowedAmount,
        bytes calldata signature
    ) internal virtual hasRight(uint248(burnTokenIds.length), allowedAmount, signature) {
        _exchange(burnTokenIds, allowedAmount);
    }
}
