// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.5.17;

import "../PToken/PToken.sol";

contract PriceOracleInterface {
    /// @notice Indicator that this is a PriceOracle contract (for inspection)
    bool public constant isPriceOracle = true;

    /**
      * @notice Get the price of underlying pToken asset. Decimals: 36 - underlyingDecimals
      */
    function getUnderlyingPrice(PToken pToken) public view returns (uint);

    /*
     * @notice ETH == address(0)
     */
    function getPriceOfUnderlying(address token, uint decimals) public view returns (uint);

    function isTokenSupported(address token) public view returns (bool);

    function isPTokenSupported(PToken pToken) public view returns (bool);
}
