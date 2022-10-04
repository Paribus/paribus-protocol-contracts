// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import "./PriceOracleInterface.sol";
import "../PToken/PErc20.sol";

contract SimplePriceOracle is PriceOracleInterface {
    mapping(address => uint) prices;

    function _getUnderlyingAddress(PToken pToken) private view returns (address) {
        if (compareStrings(pToken.symbol(), "pETH"))
            return 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

        return address(PErc20(address(pToken)).underlying());
    }

    function getUnderlyingPrice(PToken pToken) public view returns (uint) {
        return prices[_getUnderlyingAddress(pToken)];
    }

    function setUnderlyingPrice(PToken pToken, uint underlyingPriceMantissa) public {
        assert(pToken.isPToken());
        prices[_getUnderlyingAddress(pToken)] = underlyingPriceMantissa;
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
