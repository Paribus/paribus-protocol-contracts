// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import "./Impl/ChainlinkPriceOracle.sol";
import "./Impl/Api3PriceOracle.sol";

contract MumbaiPriceOracle is ChainlinkPriceOracle, Api3PriceOracle {
    constructor() public {
        chainlinkDataFeeds[address(0)] = address(0); // wbtc
        chainlinkDataFeeds[address(0)] = address(0); // eth
        chainlinkDataFeeds[address(0)] = address(0); // weth
        chainlinkDataFeeds[address(0)] = address(0); // dai
        stablecoinsPrices[address(0)] = 1000000000000000000000000000000; // usdc == 1 USD
        stablecoinsPrices[address(0)] = 10000000000000000; // pbx == 0.01 USD
        api3DataFeedNames[address(0)] = "";
        pEtherAddress = address(0);
        api3DapiServer = 0x71Da7A936fCaEd1Ee364Df106B12deF6D1Bf1f14;
    }

    function getUnderlyingPrice(PToken pToken) public view returns (uint256) {
        (uint256 underlyingDecimals, address underlyingAddress) = getUnderlyingDecimalsAndAddress(pToken);

        if (stablecoinsPrices[underlyingAddress] > 0) return StablecoinsPriceOracle.getPriceOfUnderlying(underlyingAddress);
        if (chainlinkDataFeeds[underlyingAddress] != address(0)) return ChainlinkPriceOracle.getPriceOfUnderlying(underlyingDecimals, underlyingAddress);
        return Api3PriceOracle.getPriceOfUnderlying(underlyingDecimals, underlyingAddress);
    }
}
