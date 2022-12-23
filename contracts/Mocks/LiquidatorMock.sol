// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "../Liquidator.sol";

contract LiquidatorMock is Liquidator {
    constructor(address provider, address swapRouter) public Liquidator(provider, swapRouter) { }
}
