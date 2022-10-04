// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

import "@chainlink/contracts/src/v0.5/interfaces/AggregatorV3Interface.sol";

contract ChainlinkAggregatorV3Mock is AggregatorV3Interface {
  function decimals() external override view returns (uint8) {
    return decimalsMock;
  }

  function description() external override view returns (string memory) { revert("not implemented"); }
  function version() external override view returns (uint256) { revert("not implemented"); }

  int256 answerMock;
  uint8 decimalsMock;

  constructor(int256 _answer, uint8 _decimals) public {
    answerMock = _answer;
    decimalsMock = _decimals;
  }

  function getRoundData(uint80)
    external
    override
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    ) {
    return (42, answerMock, 42, 42, 42);
  }

  function latestRoundData()
    external
    override
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    ) {
    return (42, answerMock, 42, 42, 42);
  }
}
