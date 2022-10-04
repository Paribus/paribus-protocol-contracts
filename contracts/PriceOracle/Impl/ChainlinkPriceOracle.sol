// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import "@chainlink/contracts/src/v0.5/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.5/interfaces/FlagsInterface.sol";
import "../../Utils/SafeMath.sol";
import "../../PToken/PErc20.sol";
import "./StablecoinsPriceOracle.sol";

contract ChainlinkPriceOracle is StablecoinsPriceOracle {
    using SafeMath for uint256;
    using SafeMath for uint8;
    using SafeMath for int;

    mapping(address => address) public chainlinkDataFeeds; // underlying address => underlying asset price data feed

    function getPriceOfUnderlying(uint underlyingDecimals, address underlyingAddress) internal view returns (uint) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(chainlinkDataFeeds[underlyingAddress]);

        (, int price, , /*uint timeStamp*/, ) = priceFeed.latestRoundData();
        assert(price >= 0);

        uint256 priceDecimals = priceFeed.decimals();
        uint256 wantedDecimals = SafeMath.sub(36, underlyingDecimals);

        assert(underlyingDecimals + priceDecimals <= 36);
        return uint256(price).mul(10 ** wantedDecimals.sub(priceDecimals));
    }

    function getUnderlyingPrice(PToken pToken) public view returns (uint) {
        (uint256 underlyingDecimals, address underlyingAddress) = getUnderlyingDecimalsAndAddress(pToken);

        if (stablecoinsPrices[underlyingAddress] > 0) return StablecoinsPriceOracle.getPriceOfUnderlying(underlyingAddress);
        return getPriceOfUnderlying(underlyingDecimals, underlyingAddress);
    }
}

contract L2ChainlinkPriceOracle is ChainlinkPriceOracle {
    address internal FLAG_SEQ_OFFLINE;
    FlagsInterface internal chainlinkFlags;

    function getPriceOfUnderlying(uint underlyingDecimals, address underlyingAddress) internal view returns (uint) {
        bool isRaised = chainlinkFlags.getFlag(FLAG_SEQ_OFFLINE);
        if (isRaised) {
            // If flag is raised we shouldn't perform any critical operations
            revert("Chainlink feeds are not being updated");
        }

        return ChainlinkPriceOracle.getPriceOfUnderlying(underlyingDecimals, underlyingAddress);
    }
}
