const Portfolio = require("./portfolio");
const config = require("./config");
const BN = require("bignumber.js");
//move currency and asset to a config - its time
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
        this._currency = this._currency.free.minus(order.quantity.multipliedBy(order.price));
        this._asset = this._asset.free.plus(order.quantity.multipliedBy(order.price));
    }

    executeSell(order){
        this._currency = this._currency.plus(order.quantity.multipliedBy(order.price))
        this._asset = this._asset.minus(order.quantity.multipliedBy(order.price));
    }
}

module.exports = MockPortfolio;