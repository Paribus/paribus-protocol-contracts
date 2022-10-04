// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.5.16;

import "../PriceOracleInterface.sol";
import "../../PToken/PErc20.sol";

contract PriceOracleCommonImpl is PriceOracleInterface {
    address public pEtherAddress;

    function getUnderlyingDecimalsAndAddress(PToken pToken) public view returns (uint256, address) {
        if (address(pToken) == pEtherAddress) return (18, address(0));

        else {
            PErc20 pErc20 = PErc20(address(pToken));
            return (EIP20Interface(pErc20.underlying()).decimals(), pErc20.underlying());
        }
    }
}
