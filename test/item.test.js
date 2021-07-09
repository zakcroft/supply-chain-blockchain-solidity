const ItemManager = artifacts.require("./ItemManager.sol");
const Item = artifacts.require("./Item.sol");

contract("Item", (accounts) => {
  let owner;
  let notOwner;
  let itemManagerInstance;
  let itemInstance;
  let itemName;
  let itemPrice;

  beforeEach(async () => {
    owner = accounts[0];
    notOwner = accounts[1];
    itemName = "Item test";
    itemPrice = 100;
    itemManagerInstance = await ItemManager.new();
    itemInstance = await Item.new(itemManagerInstance.address, itemPrice, 1);
  });

  it.only("item receives payment", async () => {
    console.log(typeof itemInstance.address);
    const res = await web3.eth.sendTransaction({ from: owner, to: itemInstance.address, value: itemPrice });
    // const storedItem = await itemManagerInstance.items(0)
    // console.log(storedItem);
  });
});
