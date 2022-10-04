// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.5.16;

import "../PToken/PToken.sol";

contract PriceOracleInterface {
    /// @notice Indicator that this is a PriceOracle contract (for inspection)
    bool public constant isPriceOracle = true;

    /**
      * @notice Get the underlying price of a pToken asset
      * @param pToken The pToken to get the underlying price of
      * @return The underlying asset price mantissa (scaled by 1e18).
      *  Zero means the price is unavailable.
      */
    function getUnderlyingPrice(PToken pToken) public view returns (uint);
}
