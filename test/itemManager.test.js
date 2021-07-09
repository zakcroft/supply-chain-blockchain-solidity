const truffleAssert = require("truffle-assertions");

const ItemManager = artifacts.require("./ItemManager.sol");

contract("ItemManager", (accounts) => {
  let owner;
  let notOwner;
  let itemManagerInstance;
  let itemName;
  let itemPrice;

  beforeEach(async () => {
    owner = accounts[0];
    notOwner = accounts[1];
    itemManagerInstance = await ItemManager.new();
    itemName = "Item test";
    itemPrice = 100;
  });

  it("only owner can create an item.", async () => {
    await truffleAssert.fails(
      itemManagerInstance.createItem(itemName, itemPrice, { from: notOwner }),
      truffleAssert.ErrorType.REVERT,
      null,
      "Only Owner can create an item"
    );
  });

  it("only owner can deliver an item.", async () => {
    await itemManagerInstance.createItem(itemName, itemPrice, {
      from: owner,
    });
    const paidItem = await itemManagerInstance.triggerPayment(0, {
      from: owner,
      value: itemPrice,
    });

    await truffleAssert.fails(
      itemManagerInstance.triggerDelivery(0, {
        from: notOwner,
      }),
      truffleAssert.ErrorType.REVERT,
      null,
      "Only Owner can deliver an item"
    );
  });

  it("should create an item.", async () => {
    const res = await itemManagerInstance.createItem(itemName, itemPrice, {
      from: owner,
    });

    // test event
    assert.equal(res.logs[0].args._itemIndex, 0, "Its not the first item");
    assert.equal(res.logs[0].args.step, 0, "Step should be 0");

    // test stored item
    const storedItem = await itemManagerInstance.items(0);
    assert.equal(
      storedItem._item,
      res.logs[0].args._itemAddress,
      "event _itemAddress is not the same as the created item address"
    );
    assert.equal(
      storedItem._identifier,
      itemName,
      "_identifier is not correct"
    );
    assert.equal(storedItem._itemPrice, itemPrice, "_itemPrice is not correct");
    assert.equal(storedItem._state, 0, "_state is not correct");
  });

  it("should update item on payment", async () => {
    await itemManagerInstance.createItem(itemName, itemPrice, {
      from: owner,
    });
    const paidItem = await itemManagerInstance.triggerPayment(0, {
      from: owner,
      value: itemPrice,
    });
    console.log(paidItem.logs);
    //test event
    assert.equal(paidItem.logs[0].args._itemIndex, 0, "Its not the first item");
    assert.equal(paidItem.logs[0].args.step, 1, "Step should be 1");

    // test stored item
    const storedItem = await itemManagerInstance.items(0);
    assert.equal(storedItem._state, 1, "_state is not correct");
  });

  it("should update item on delivery", async () => {
    await itemManagerInstance.createItem(itemName, itemPrice, {
      from: owner,
    });
    await itemManagerInstance.triggerPayment(0, {
      from: owner,
      value: itemPrice,
    });
    const deliveredItem = await itemManagerInstance.triggerDelivery(0, {
      from: owner,
    });

    //test event
    assert.equal(
      deliveredItem.logs[0].args._itemIndex,
      0,
      "Its not the first item"
    );
    assert.equal(deliveredItem.logs[0].args.step, 2, "Step should be 2");

    // test stored item
    const storedItem = await itemManagerInstance.items(0);
    assert.equal(storedItem._state, 2, "_state is not correct");
  });

  it("should fail when paid when already delivered", async () => {
    await itemManagerInstance.createItem(itemName, itemPrice, {
      from: owner,
    });
    await itemManagerInstance.triggerPayment(0, {
      from: owner,
      value: itemPrice,
    });
    await itemManagerInstance.triggerDelivery(0, {
      from: owner,
    });

    await truffleAssert.fails(
      itemManagerInstance.triggerPayment(0, {
        from: owner,
        value: itemPrice,
      }),
      truffleAssert.ErrorType.REVERT,
      null,
      "Should fail when paying when already delivered"
    );
  });

  it("should fail when delivery when not paid", async () => {
    await itemManagerInstance.createItem(itemName, itemPrice, {
      from: owner,
    });
    await truffleAssert.fails(
      itemManagerInstance.triggerDelivery(0, {
        from: owner,
      }),
      truffleAssert.ErrorType.REVERT,
      null,
      "Should fail when delivery when not paid"
    );
  });
});
