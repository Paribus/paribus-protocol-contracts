// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import "../../Utils/SafeMath.sol";
import "../../PToken/PErc20.sol";
import "../../Interfaces/Api3Interfaces.sol";
import "./StablecoinsPriceOracle.sol";

contract Api3PriceOracle is StablecoinsPriceOracle {
    using SafeMath for uint256;
    using SafeMath for uint8;
    using SafeMath for int;

    mapping(address => bytes32) public api3DataFeedNames; // underlying address => data feed name
    address public api3DapiServer;

    function getPriceOfUnderlying(uint underlyingDecimals, address underlyingAddress) internal view returns (uint) {
        (int price, /* uint timestamp */) = Api3IDapiServer(api3DapiServer).readDataFeedWithDapiName(api3DataFeedNames[underlyingAddress]);
        assert(price >= 0);

        assert(underlyingDecimals <= 18);
        uint256 wantedDecimals = SafeMath.sub(36, underlyingDecimals);

        return uint256(price).mul(10 ** wantedDecimals.sub(18));
    }

    function getUnderlyingPrice(PToken pToken) public view returns (uint256) {
        (uint256 underlyingDecimals, address underlyingAddress) = getUnderlyingDecimalsAndAddress(pToken);

        if (stablecoinsPrices[underlyingAddress] > 0) return StablecoinsPriceOracle.getPriceOfUnderlying(underlyingAddress);
        return getPriceOfUnderlying(underlyingDecimals, underlyingAddress);
    }
}
