import React, { Component } from "react";
import getWeb3 from "./getWeb3";

import ItemManager from "./contracts/ItemManager.json";
import Item from "./contracts/Item.json";

import "./App.css";

class App extends Component {
  state = { cost: 100, itemName: "Test item 1", loaded: false };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.itemManager = new this.web3.eth.Contract(
        ItemManager.abi,
        ItemManager.networks[this.networkId] &&
          ItemManager.networks[this.networkId].address
      );

      this.item = new this.web3.eth.Contract(
        Item.abi,
        Item.networks[this.networkId] && Item.networks[this.networkId].address
      );

      this.listenToPaymentEvent();
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded: true }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  handleInputChange = ({ target, type }) => {
    const val = type === "checkbox" ? target.checked : target.value;
    this.setState({
      [target.name]: val,
    });
  };

  handleSubmit = async () => {
    const { cost, itemName } = this.state;
    await this.itemManager.methods
      .createItem(itemName, cost)
      .send({ from: this.accounts[0] });
  };

  // send to item address receive()
  handlePay = async (itemAddress, payment) => {
    await this.web3.eth.sendTransaction({
      from: this.accounts[0],
      to: itemAddress,
      value: payment,
    });
  };

  handleDelivered = async (index) => {
    await this.itemManager.methods
      .triggerDelivery(index)
      .send({ from: this.accounts[0] });
  };

  listenToPaymentEvent = () => {
    this.itemManager.events.SupplyChainStep().on("data", async (e) => {
      const index = e.returnValues._itemIndex;
      const itemInstance = await this.itemManager.methods.items(index).call();
      this.setState({
        itemInstance,
        index,
      });
      //console.log("item", itemInstance, index);
    });
  };

  render() {
    const { loaded, itemName, cost, itemInstance, index } = this.state;
    if (!loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Simply Payment/Supply Chain</h1>
        <div className="container">
          <div className="info">
            <h2>1: Add Item</h2>
            <div className="input name">
              <label>Item Name:</label>
              <input
                type="text"
                name="itemName"
                value={this.state.itemName}
                onChange={this.handleInputChange}
                placeholder={"Add name"}
              />
            </div>
            <div className="input cost">
              <label>Cost (wei):</label>
              <input
                type="number"
                name="cost"
                value={this.state.cost}
                onChange={this.handleInputChange}
                placeholder={"Add price"}
              />
            </div>
          </div>
          <button
            className="create"
            type="button"
            onClick={this.handleSubmit}
            disabled={!(cost && itemName)}
          >
            Create new Item
          </button>
        </div>
        {itemInstance && itemInstance._state >= "0" ? (
          <div className="container pay">
            <div className="info">
              <h2>
                2: Pay for Item: <i>{itemInstance._identifier}</i>
              </h2>
              <p>Address: {itemInstance._item}</p>
              <div className="input pay">
                <label>Cost (wei):</label>
                <input
                  type="number"
                  name="cost"
                  value={itemInstance._itemPrice}
                  onChange={this.handleInputChange}
                  placeholder={"Add price"}
                  disabled
                />
              </div>
            </div>

            <button
              className="create"
              type="button"
              onClick={() =>
                this.handlePay(itemInstance._item, itemInstance._itemPrice)
              }
            >
              Pay for Item
            </button>
          </div>
        ) : null}
        {itemInstance && itemInstance._state >= "1" ? (
          <div className="container delivered">
            <div className="info">
              <h2>
                3: Mark as delivered: <i>{itemInstance._identifier}</i>
              </h2>
              <p>Address: {itemInstance._item}</p>
            </div>
            <button
              className="create"
              type="button"
              onClick={() => this.handleDelivered(index)}
            >
              Delivered
            </button>
          </div>
        ) : null}
        {itemInstance && itemInstance._state === "2" ? (
          <div className="container pay">
            <div className="info">
              <h2>
                Delivered <i>{itemInstance._identifier}</i>
              </h2>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
