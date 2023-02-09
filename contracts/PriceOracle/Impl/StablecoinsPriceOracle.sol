// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.5.17;

import "./PriceOracleCommonImpl.sol";

contract StablecoinsPriceOracle is PriceOracleCommonImpl {
    mapping(address => uint256) public stablecoinsPrices; // underlying stablecoin address => fixed stablecoin price, 18 decimals

    function getPriceOfUnderlying(address token, uint decimals) public view returns (uint) {
        require(isTokenSupported(token), "TOKEN_NOT_SUPPORTED");
        return adjustDecimals(18, decimals, stablecoinsPrices[token]);
    }

    function isTokenSupported(address token) public view returns (bool) {
        return stablecoinsPrices[token] > 0;
    }
}
