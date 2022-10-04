// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import "../Interfaces/AaveInterfaces.sol";
import "../Interfaces/EIP20Interface.sol";

contract AavePoolMock is AaveIPool {
    function flashLoanSimple(address receiverAddress, address asset, uint256 amount, bytes calldata params, uint16 /*referralCode*/) external {
        uint256 fee = uint256(10) ** EIP20Interface(asset).decimals(); // 1 token
        EIP20Interface(asset).transfer(receiverAddress, amount);
        AaveIFlashLoanSimpleReceiver(receiverAddress).executeOperation(asset, amount, fee, tx.origin, params);
        require(EIP20Interface(asset).transferFrom(receiverAddress, address(this), amount + fee), "transferFrom failed");
    }
}

contract AavePoolAddressesProviderMock is AaveIPoolAddressesProvider {
    AaveIPool public poolMock;

    constructor() public {
        poolMock = new AavePoolMock();
    }

    function getPool() external view returns (address) {
        return address(poolMock);
    }
}
