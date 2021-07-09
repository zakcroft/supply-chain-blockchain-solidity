// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Item.sol";

contract ItemManager is Ownable {
    enum SupplyChainState {
        Created,
        Paid,
        Delivered
    }

    event SupplyChainStep(
        uint256 _itemIndex,
        uint256 step,
        address _itemAddress
    );

    event test_value(uint256 indexed value1);
    struct S_Item {
        Item _item;
        string _identifier;
        uint256 _itemPrice;
        ItemManager.SupplyChainState _state;
    }

    mapping(uint256 => S_Item) public items;
    uint256 itemIndex;

    function createItem(string memory _identifier, uint256 _itemPrice)
        public
        onlyOwner
    {
        Item item = new Item(this, _itemPrice, itemIndex);
        items[itemIndex]._item = item;
        items[itemIndex]._identifier = _identifier;
        items[itemIndex]._itemPrice = _itemPrice;
        items[itemIndex]._state = SupplyChainState.Created;
        items[itemIndex]._state = SupplyChainState.Created;
        emit SupplyChainStep(
            itemIndex,
            uint256(items[itemIndex]._state),
            address(item)
        );
        itemIndex++;
    }

    function triggerPayment(uint256 i) public payable {
        require(
            items[i]._itemPrice == msg.value,
            "Only full payment is accepted"
        );
        require(
            items[i]._state == SupplyChainState.Created,
            "Item is further in the chain and had been paid"
        );
        items[i]._state = SupplyChainState.Paid;
        emit SupplyChainStep(
            i,
            uint256(items[i]._state),
            address(items[i]._item)
        );
    }

    function triggerDelivery(uint256 i) public onlyOwner {
        require(
            items[i]._state == SupplyChainState.Paid,
            "Item has not been paid"
        );
        items[i]._state = SupplyChainState.Delivered;
        emit SupplyChainStep(
            i,
            uint256(items[i]._state),
            address(items[i]._item)
        );
    }
}
