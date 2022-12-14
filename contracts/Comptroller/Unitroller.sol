// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.5.16;

import "../ErrorReporter.sol";
import "./ComptrollerStorage.sol";
import "./ComptrollerInterface.sol";

/**
 * @title ComptrollerCore
 * @dev Storage for the comptroller is at this address, while execution is delegated to the `comptrollerImplementation`.
 * PTokens should reference this contract as their comptroller.
 */
contract Unitroller is UnitrollerAdminStorage {
    /**
      * @notice Emitted when pendingComptrollerImplementation is changed
      */
    event NewPendingImplementations(address oldPendingPart1Implementation, address newPendingPart1Implementation, address oldPendingPart2Implementation, address newPendingPart2Implementation);

    /**
      * @notice Emitted when pendingComptrollerImplementation is accepted, which means comptroller implementation is updated
      */
    event NewImplementation(address oldPart1Implementation, address newPart1Implementation, address oldPart2Implementation, address newPart2Implementation);

    /**
      * @notice Emitted when pendingAdmin is changed
      */
    event NewPendingAdmin(address oldPendingAdmin, address newPendingAdmin);

    /**
      * @notice Emitted when pendingAdmin is accepted, which means admin is updated
      */
    event NewAdmin(address oldAdmin, address newAdmin);

    constructor() public {
        // Set admin to caller
        admin = msg.sender;
    }

    /// @notice Indicator that this is a Comptroller contract (for inspection)
    function isComptroller() external pure returns (bool) {
        return true;
    }

    /*** Admin Functions ***/
    function _setPendingImplementations(address newPendingPart1Implementation, address newPendingPart2Implementation) public {
        require(newPendingPart1Implementation != address(0) && newPendingPart2Implementation != address(0));
        require(msg.sender == admin, "Error.UNAUTHORIZED: FailureInfo.SET_PENDING_IMPLEMENTATION_OWNER_CHECK");

        {
            ComptrollerInterface part1 = ComptrollerInterface(newPendingPart1Implementation);
            ComptrollerInterface part2 = ComptrollerInterface(newPendingPart2Implementation);
            require(part1.isComptrollerPart1() && !part1.isComptroller());
            require(part2.isComptrollerPart2() && !part2.isComptroller());
        }

        _setPendingImplementationsInternal(newPendingPart1Implementation, newPendingPart2Implementation);
    }

    function _setPendingImplementationsInternal(address newPendingPart1Implementation, address newPendingPart2Implementation) internal {
        address oldPendingPart1Implementation = pendingComptrollerPart1Implementation;
        address oldPendingPart2Implementation = pendingComptrollerPart2Implementation;

        pendingComptrollerPart1Implementation = newPendingPart1Implementation;
        pendingComptrollerPart2Implementation = newPendingPart2Implementation;

        emit NewPendingImplementations(oldPendingPart1Implementation, pendingComptrollerPart1Implementation, oldPendingPart2Implementation, pendingComptrollerPart2Implementation);
    }

    /**
    * @notice Accepts new implementation of comptroller. msg.sender must be pendingPart1Implementation or pendingPart2Implementation
    * @dev Admin function for new implementation to accept it's role as implementation
    */
    function _acceptImplementation() public {
        if (msg.sender == pendingComptrollerPart1Implementation) {
            address oldImplementation = comptrollerPart1Implementation;
            comptrollerPart1Implementation = pendingComptrollerPart1Implementation;
            emit NewImplementation(oldImplementation, comptrollerPart1Implementation, comptrollerPart2Implementation, comptrollerPart2Implementation);

            _setPendingImplementationsInternal(address(0), pendingComptrollerPart2Implementation);

        } else if (msg.sender == pendingComptrollerPart2Implementation) {
            // Save current values for inclusion in log
            address oldImplementation = comptrollerPart2Implementation;
            comptrollerPart2Implementation = pendingComptrollerPart2Implementation;
            emit NewImplementation(comptrollerPart1Implementation, comptrollerPart1Implementation, oldImplementation, comptrollerPart2Implementation);

            _setPendingImplementationsInternal(pendingComptrollerPart1Implementation, address(0));

        } else {
            require(false, "FailureInfo.ACCEPT_PENDING_IMPLEMENTATION_ADDRESS_CHECK");
        }
    }

    /**
      * @notice Begins transfer of admin rights. The newPendingAdmin must call `_acceptAdmin` to finalize the transfer.
      * @dev Admin function to begin change of admin. The newPendingAdmin must call `_acceptAdmin` to finalize the transfer.
      * @param newPendingAdmin New pending admin.
      */
    function _setPendingAdmin(address newPendingAdmin) public {
        // Check caller = admin
        require(msg.sender == admin, "Error.UNAUTHORIZED: FailureInfo.SET_PENDING_ADMIN_OWNER_CHECK");

        // Save current value, if any, for inclusion in log
        address oldPendingAdmin = pendingAdmin;

        // Store pendingAdmin with value newPendingAdmin
        pendingAdmin = newPendingAdmin;

        // Emit NewPendingAdmin(oldPendingAdmin, newPendingAdmin)
        emit NewPendingAdmin(oldPendingAdmin, newPendingAdmin);
    }

    /**
      * @notice Accepts transfer of admin rights. msg.sender must be pendingAdmin
      * @dev Admin function for pending admin to accept role and update admin
      */
    function _acceptAdmin() public {
        // Check caller is pendingAdmin and pendingAdmin ??? address(0)
        require(msg.sender == pendingAdmin && msg.sender != address(0), "Error.UNAUTHORIZED: FailureInfo.ACCEPT_ADMIN_PENDING_ADMIN_CHECK");

        // Save current values for inclusion in log
        address oldAdmin = admin;
        address oldPendingAdmin = pendingAdmin;

        // Store admin with value pendingAdmin
        admin = pendingAdmin;

        // Clear the pending value
        pendingAdmin = address(0);

        emit NewAdmin(oldAdmin, admin);
        emit NewPendingAdmin(oldPendingAdmin, pendingAdmin);
    }

    /**
     * @dev Delegates execution to an implementation contract.
     * It returns to the external caller whatever the implementation returns
     * or forwards reverts.
     */
    function() external payable {
        // delegate all other functions to current implementation
        (bool success,) = comptrollerPart1Implementation.delegatecall(msg.data);

        assembly {
            let free_mem_ptr := mload(0x40)
            returndatacopy(free_mem_ptr, 0, returndatasize)

            switch success
            case 0 {revert(free_mem_ptr, returndatasize)}
            default {return (free_mem_ptr, returndatasize)}
        }
    }
}
