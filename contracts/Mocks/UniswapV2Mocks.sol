// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.16;

import "../Interfaces/EIP20Interface.sol";

contract UniswapV2FactoryMock /*is IUniswapV2Factory*/ {

}

contract UniswapV2Router02Mock /*is IUniswapV2Router02*/ {
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint /*deadline*/) external returns (uint[] memory) {
        require(path.length == 2, "not supported");
        address assetIn = path[0];
        address assetOut = path[path.length - 1];
        EIP20Interface(assetIn).transferFrom(msg.sender, address(this), amountIn);
        uint256 extra = 10 * uint256(10) ** EIP20Interface(assetOut).decimals();
        EIP20Interface(assetOut).transfer(to, amountOutMin + extra); // amountOutMin + 10 tokens
        uint[] memory result = new uint[](1);
        result[0] = amountOutMin + extra;
        return result;
    }
}
