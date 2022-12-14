// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.5.16;

import "./PErc20.sol";

/**
 * @title Paribus's PErc20Delegate Contract
 * @notice PTokens which wrap an EIP-20 underlying and are delegated to
 * @author Compound, Paribus
 */
contract PErc20Delegate is PErc20, PTokenDelegateInterface {
    /**
     * @notice Construct an empty delegate
     */
    constructor() public {}

    /**
     * @notice Called by the delegator on a delegate to initialize it for duty. Should not be marked as pure
     * @param data The encoded bytes data for any initialization
     */
    function _becomeImplementation(bytes memory data) public {
        data; // Shh -- currently unused
        require(msg.sender == admin, "only the admin may call _becomeImplementation");
    }

    /**
     * @notice Called by the delegator on a delegate to forfeit its responsibility. Should not be marked as pure
     */
    function _resignImplementation() public {
        require(msg.sender == admin, "only the admin may call _resignImplementation");
    }
}
