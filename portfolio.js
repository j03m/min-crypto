const BigNumber = require('bignumber.js');
const _ = require("lodash");
const config = require("./config");
/**
 * When candle comes in, we're going to base our trades off of the close, which is a single
 * number denoting how much of the QUOTE (or asset) you can buy with 1 of the BASE where
 * pairs like ETH/BTC are BASE/QUOTE. So a candle like:
 *
 * ```
     {
          eventType: 'kline',
          eventTime: 1508613366276,
          symbol: 'ETHBTC',
          open: '0.04898000',
          high: '0.04902700',
          low: '0.04898000',
          close: '0.04901900',
          volume: '37.89600000',
          trades: 30,
          interval: '5m',
          isFinal: false,
          quoteVolume: '1.85728874',
          buyVolume: '21.79900000',
          quoteBuyVolume: '1.06838790'
    }
 *
 * ```
 *  Means we can buy 0.004901900 BTC with one ETH.
 */

class Portfolio {
    constructor(currencyBalance, assetBalance){
        this._currency = Portfolio.convertBalance(currencyBalance);
        this._asset = Portfolio.convertBalance(assetBalance);
    }

    static portfolioFactory(balances, currency, asset){
        const currencyBalance = Portfolio.findBalance(balances, currency === undefined ? config.currency : currency);
        const assetBalance = Portfolio.findBalance(balances, asset === undefined ? config.asset : asset);
        return new Portfolio(currencyBalance, assetBalance);
    }

    static findBalance(balances, item) {
        return balances.reduce((accum, balanceObj) => {
            if (balanceObj.asset === item) {
                accum = balanceObj;
            }
            return accum;
        }, {asset: item, free: '0.00000000', locked: '0.00000000'});
    }

    static convertBalance(balance){
        return {
            asset: balance.asset,
            free: new BigNumber(balance.free),
            locked: new BigNumber(balance.locked)
        }
    }

    static getAmount(shares, price){
        return price.multipliedBy(shares);
    }

    canBuy(shares, price){
        //enough base free?
        const amount = price.multipliedBy(shares);
        return this._asset.free.minus(amount).isGreaterThanOrEqualTo(0);
    }

    canSell(shares){
        const amount = shares;
        return this._currency.free.minus(amount).isGreaterThanOrEqualTo(0);
    }

    value(assetTether, currencyTether) {
      const assetValue = this.asset.free.plus(this.asset.locked).times(assetTether);
      const currencyValue = this.currency.free.plus(this.currency.locked).times(currencyTether);
      return assetValue.plus(currencyValue);
    }

    get asset () {
        return this._asset;
    }

    get currency () {
        return this._currency;
    }
}


module.exports = Portfolio;