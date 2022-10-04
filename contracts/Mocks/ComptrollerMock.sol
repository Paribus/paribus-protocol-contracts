// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import "../Comptroller/ComptrollerPart1.sol";
import "../Comptroller/ComptrollerPart2.sol";

contract ComptrollerMockBase is ComptrollerInterface, ComptrollerPart1, ComptrollerPart2 {
    constructor() public { }

    function isComptroller() external pure returns (bool) {
        return true;
    }
}

contract ComptrollerAdminChangeMock is ComptrollerMockBase { // Comptroller with the ability to change admin
    address public pendingAdmin;

    constructor(address _admin) public {
        admin = _admin;
    }

    function _setPendingAdmin(address newPendingAdmin) public returns (uint) {
        onlyAdmin();
        pendingAdmin = newPendingAdmin;
        return uint(Error.NO_ERROR);
    }

    function _acceptAdmin() public returns (uint) {
        if (msg.sender != pendingAdmin || msg.sender == address(0)) {
            return fail(Error.UNAUTHORIZED, FailureInfo.ACCEPT_ADMIN_PENDING_ADMIN_CHECK);
        }

        admin = pendingAdmin;
        pendingAdmin = address(0);

        return uint(Error.NO_ERROR);
    }
}

contract AllowingComptrollerMock is ComptrollerMockBase { // Comptroller with no business restrictions
    function mintAllowed(address, address, uint) external returns (uint) { return uint(Error.NO_ERROR); }
    function mintVerify(address, address, uint, uint) external { }
    function redeemVerify(address, address, uint, uint) external { }
    function borrowVerify(address, address, uint) external { }
    function transferVerify(address, address, address, uint) external { }
    function redeemAllowed(address, address, uint) external returns (uint) { return uint(Error.NO_ERROR); }
    function borrowAllowed(address, address, uint) external returns (uint) { return uint(Error.NO_ERROR); }
    function transferAllowed(address, address, address, uint) external returns (uint) { return uint(Error.NO_ERROR); }
    function repayBorrowAllowed(address, address, address, uint) external returns (uint) { return uint(Error.NO_ERROR); }
    function repayBorrowVerify(address, address, address, uint, uint) external { }
    function liquidateBorrowVerify(address, address, address, address, uint, uint) external { }
    function seizeAllowed(address, address, address, address, uint) external returns (uint) { return uint(Error.NO_ERROR); }
    function seizeVerify(address, address, address, address, uint) external { }
    function liquidateBorrowAllowed(address, address, address, address, uint) external returns (uint) { return uint(Error.NO_ERROR); }
}

contract ComptrollerStorageV2Mock is ComptrollerStorage {
    int foo;
    int bar;
}

contract ComptrollerPart1V2Mock is ComptrollerStorageV2Mock, ComptrollerPart1 {
    function getFoo() external view returns (int) {
        return foo;
    }

    function setFoo(int _foo) external {
        foo = _foo;
    }
}

contract ComptrollerPart2V2Mock is ComptrollerStorageV2Mock, ComptrollerPart2 {
    function getBar() external view returns (int) {
        return bar;
    }

    function setBar(int _bar) external {
        bar = _bar;
    }
}

contract ComptrollerV2Interface is ComptrollerPart1V2Mock, ComptrollerPart2V2Mock { }
