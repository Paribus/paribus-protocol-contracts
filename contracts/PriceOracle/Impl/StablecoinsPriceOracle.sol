// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import "./PriceOracleCommonImpl.sol";

contract StablecoinsPriceOracle is PriceOracleCommonImpl {
    mapping(address => uint256) public stablecoinsPrices; // underlying stablecoin address => fixed stablecoin price

    function getPriceOfUnderlying(address underlying) internal view returns (uint) {
        return stablecoinsPrices[underlying];
    }

    function getUnderlyingPrice(PToken pToken) public view returns (uint) {
        (, address underlyingAddress) = getUnderlyingDecimalsAndAddress(pToken);
        return getPriceOfUnderlying(underlyingAddress);
    }
}
