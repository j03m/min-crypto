const Portfolio = require("./portfolio");
const config = require("./config").default;
const BN = require("bignumber.js");

class MockPortfolio extends Portfolio {
    constructor(input){
        const currencyBalance = Portfolio.findBalance(input.balances, config.currency);
        const assetBalance = Portfolio.findBalance(input.balances, config.asset);
        super(currencyBalance, assetBalance);
    }

    mockExecute(order){
        //convert balances, trigger ws updates
        if (order.side === "BUY"){
            this.executeBuy(order);
        }
        else if (order.side === "SELL"){
            this.executeSell(order);
        }
        else {
            throw new Error("order doesn't have a valid side");
        }



    }

    bigNumberOrder(order){
        const copiedOrder = Object.assign({}, order);
        copiedOrder.quantity = BN(copiedOrder.quantity);
        copiedOrder.price = BN(copiedOrder.price);
        return copiedOrder;
    }

    executeBuy(input){
        const order = this.bigNumberOrder(input);
        //buy ASSET with CURRENCY - ETHBTC means we buy BTC with ETH
        this._currency.free = this._currency.free.minus(order.quantity.multipliedBy(order.price));
        this._asset.free = this._asset.free.plus(order.quantity);
    }

    executeSell(input){
        const order = this.bigNumberOrder(input);
        this._currency.free = this._currency.free.plus(order.quantity.multipliedBy(order.price))
        this._asset.free = this._asset.free.minus(order.quantity);
    }
}

module.exports = MockPortfolio;