// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "../../Sale.sol";

interface IERC721MultiSaleBySignature {

  function claim(uint248 amount, uint248 allowedAmount, bytes calldata signature) external payable;
  
  function exchange(uint256[] calldata burnTokenIds, uint248 allowedAmount, bytes calldata signature) external payable;

  function setSigner(address signer) external;
}