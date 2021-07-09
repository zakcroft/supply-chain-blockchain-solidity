// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ItemManager.sol";

contract Item {
    uint256 public priceInWei;
    uint256 public pricePaid;
    uint256 public index;

    ItemManager parentContract;

    constructor(
        ItemManager _parentContract,
        uint256 _priceInWei,
        uint256 _index
    ) {
        parentContract = _parentContract;
        priceInWei = _priceInWei;
        index = _index;
    }

    receive() external payable {
        require(msg.value == priceInWei, "We don't support partial payments");
        require(pricePaid == 0, "Item is already paid!");
        pricePaid += msg.value;
        (bool success, ) = address(parentContract).call{value: msg.value}(
            abi.encodeWithSignature("triggerPayment(uint256)", index)
        );
        require(success, "Delivery did not work");
    }

    fallback() external {}
}
