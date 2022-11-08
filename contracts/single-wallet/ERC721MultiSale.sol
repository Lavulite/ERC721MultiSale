// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "./IERC721MultiSale.sol";
import "../BasicSale.sol";
import "../SalesRecord.sol";

abstract contract ERC721MultiSale is IERC721MultiSale, BasicSale {
    // ==================================================================
    // Modifier
    // ==================================================================
    mapping(address => SalesRecord) internal _salesRecordByBuyer;

    // ==================================================================
    // Modifier
    // ==================================================================
    modifier isNotOverAllowedAmount(uint256 amount, uint256 allowedAmount) {
        require(
            getBuyCount() + amount <= allowedAmount,
            "claim is over allowed amount."
        );
        _;
    }

    // ==================================================================
    // Function
    // ==================================================================
    // ------------------------------------------------------------------
    // external & public
    // ------------------------------------------------------------------
    function getBuyCount() public view returns (uint256) {
        SalesRecord storage record = _salesRecordByBuyer[msg.sender];

        if (record.id == _currentSale.id) {
            return record.amount;
        } else {
            return 0;
        }
    }

    // ------------------------------------------------------------------
    // internal & private
    // ------------------------------------------------------------------
    function _claim(uint256 amount, uint256 allowedAmount)
        internal
        virtual
        whenNotPaused
        isNotOverMaxSupply(amount)
        isNotOverMaxSaleSupply(amount)
        isNotOverAllowedAmount(amount, allowedAmount)
        whenClaimSale
    {
        _record(amount);
    }

    function _exchange(uint256[] calldata burnTokenIds, uint256 allowedAmount)
        internal
        virtual
        whenNotPaused
        isNotOverMaxSaleSupply(burnTokenIds.length)
        isNotOverAllowedAmount(burnTokenIds.length, allowedAmount)
        whenExcahngeSale
    {
        _record(burnTokenIds.length);
    }

    function _record(uint256 amount) private {
        SalesRecord storage record = _salesRecordByBuyer[msg.sender];

        if (record.id == _currentSale.id) {
            record.amount += amount;
        } else {
            record.id = _currentSale.id;
            record.amount = amount;
        }

        _soldCount += amount;
    }
}
