import {BuySellStrategy} from "./config";
import {ShouldBuyRSI} from "./rsi";

const config = require("./config").default;
const indicatorConfig = require("../indicators/indicator-config").default;
const bars = require("./bars");
const BN = require("bignumber.js");
const Advice = require("./advice");
const Portfolio = require("./portfolio");
const rendr = require("../vis/rendr");
const moment = require("moment");

//TODO switch current and asset. You BUY the ASSET ETH with the CURRENCY BTC

const CURRENCY = config.currency;
const ASSET = config.asset;
const TETHER = config.tether;
let CURRENCY_TETHER;
let ASSET_TETHER;
const ORDER_SIZE = BN(config.orderSize);
const BAR_PROPERTY = config.barProperty;
const STOP_PERCENT = BN(config.stopPercent); //5%

const PERIOD = config.period;
const TICK_LEN = config.tickLen;
const BAR_LEN = config.barLen;
const WAIT_TO_TRADE = config.waitToTrade;


class Bot {
  constructor(client) {
    this._data = [];
    this._client = client;
    this._ws = client.ws;
    this._trades = {};
    this._initComplete = false;
    this._lastValue = -1;
    this._currentAdvice = null;
    this._portfolio = new Portfolio({free: 0, locked: 0}, {free: 0, locked: 0});
    this._lastTradeTime = undefined;
    this._pendingTrade = undefined;
    this._originalPortfolio == new Portfolio({free: 0, locked: 0}, {free: 0, locked: 0});
    this._firstPortfolioUpdate = false;
    this._tradeCount = 0;
    this._allCandles = [];
    this._valueHistory = [];
    this._symbol = this._client.getSymbol(config.asset, config.currency);
    if (config.requiresTether){
      CURRENCY_TETHER = this._client.getSymbol(config.currency, config.tether);
      ASSET_TETHER = this._client.getSymbol(config.asset, config.tether);
    }

    this._indicators = this._hydrateIndicators();
    this._indicatorHistory = new Map();
  }

  /**
   * Iterates over the list of indicator files, requires them
   * and sets them up by name
   * @returns {*}
   * @private
   */
  _hydrateIndicators(){
    return indicatorConfig.map((indicatorFile) => {
      return require(`../indicators/${indicatorFile}`).default;
    });
  }

  /**
   * Indicator array's need to match the data in length
   * so here we init the history array to the lenght of data
   * retrieved at initial fetch
   * @private
   */
  _backFillIndicatorHistory(){
    const numbers = this._getNumbers();
    this._indicators.forEach((indicator)=>{
      const result = indicator.generate(numbers);
      this._indicatorHistory.set(indicator.name,
        this._data.map(() => {
          return result;
        }));
    });
  }

  get history() {
    return {
      candles: this.candles,
      indicators: this._indicatorHistory,
      trades: this.trades
    }
  }

  get valueHistory() {
    return this._valueHistory;
  }

  //history
  get candles() {
    return this._allCandles;
  }

  //history
  get bands() {
    return this._bollingerBands;
  }

  //history
  get trades() {
    return this._trades;
  }

  get portfolioValues() {
    //return all port values
  }

  get initComplete() {
    return this._initComplete;
  }

  set initComplete(value) {
    this._initComplete = value;
  }

  get pendingTrade() {
    return this._pendingTrade;
  }

  // generateRSI(){
  //   const numbers = this._getNumbers();
  //   const value = RSI.generateRSI(numbers);
  //   this._rsi.push(value);
  //   return value;
  // }

  _getNumbers(){
    const numbers = this._data.map((value) => {
      return value.toNumber()
    });
    return numbers;
  }

  // generateBollingerBands() {
  //   const numbers = this._getNumbers();
  //   const stdDev2 = bands.makeBand(numbers, PERIOD, 2);
  //   const stdDev1 = bands.makeBand(numbers, PERIOD, 1);
  //   const guide = bands.makeGuide(stdDev1, stdDev2);
  //   this._bollingerBands.push(guide);
  //   return guide;
  // }

  get advice() {
    return this._currentAdvice;
  }

  get buyOrderSize(){
    if (config.buySellStategy === BuySellStrategy.allInAllOut) {
      return this._portfolio.currency.free.dividedBy(this._lastValue);
    }else{
      return ORDER_SIZE;
    }
  }

  get sellOrderSize() {
    if (config.buySellStategy === BuySellStrategy.balanced) {
      return ORDER_SIZE;
    }
    else if (config.buySellStategy === BuySellStrategy.nibbleAndFlush){
      return this._portfolio.asset.free;
    }
    else if (config.buySellStategy === BuySellStrategy.allInAllOut){
      return this._portfolio.asset.free;
    }
  }

  generateAdvice() {
    // //const bands = this._bollingerBands[this._bollingerBands.length - 1];
    // const buy = Advice.hasBuySignal(this._lastValue, bands);
    // const sell = Advice.hasSellSignal(this._lastValue, bands);
    // const rsi = this._rsi[this._rsi.length-1];
    // this._currentAdvice = {
    //   buy: buy && RSI.ShouldBuy(rsi),
    //   sell: sell && RSI.ShouldSell(rsi)
    // };
    //j03m todo: redo advice as generic
    this._currentAdvice = {
      buy: false,
      sell: false
    }
  }

  shouldStopLoss() {
    if (this._lastTrade !== undefined &&
      this._lastTrade.side === "BUY") {
      const price = BN(this._lastTrade.price);
      if (this._lastValue.isLessThan(price)) {
        return price.minus(this._lastValue).dividedBy(price).isGreaterThanOrEqualTo(STOP_PERCENT);
      }
    }
    return false;
  }


  async sendOrder(trade) {
    //j03m store here - render orders
    let response;
    response = await this._client.order(trade);
    this._trades[trade.when.getTime()] = trade;
    this._lastResponse = response;
    this._lastTrade = trade;
    this._lastTradeTime = this._lastCandle.opentime;
    return response;

  }

  async cancelOpenOrders() {
    const openOrders = await this._client.openOrders({
      symbol: this._symbol
    });
    for (let i = 0; i < openOrders.length; i++) {
      const orderId = openOrders[i].orderId;
      await this._client.cancelOrder({
        symbol: this._symbol,
        orderId: orderId
      });
    }
  }

  getBuyOrder() {
    this._pendingTrade = {
      symbol: this._symbol,
      side: 'BUY',
      quantity: this.buyOrderSize.toString(),
      price: this._lastValue.toString(),
      when: this._lastCandle.opentime
    };
    return this._pendingTrade;
  }

  pluck(data, prop) {
    return data.map((item) => {
      return item[prop];
    });
  }

  getSellOrder() {
    this._pendingTrade = {
      symbol: this._symbol,
      side: 'SELL',
      quantity: this.sellOrderSize.toString(),
      price: this._lastValue.toString(),
      when: this._lastCandle.opentime
    };
    return this._pendingTrade;
  }

  shouldTrade() {
    return this._lastTradeTime === undefined || this._lastCandle.opentime - this._lastTradeTime > WAIT_TO_TRADE;
  }

  async trade() {
    if (!this.shouldTrade()) {
      return;
    }
    // else if(this.shouldStopLoss()){
    //     await this.handleStopLoss();
    // }
    else {
      this.generateAdvice();
      const advice = this.advice;
      if (advice.buy &&
        this._portfolio.canBuy(this.buyOrderSize, this._lastValue) &&
        this._pendingTrade === undefined) {
        this._tradeCount++;
        const trade = this.getBuyOrder();
        return await this.sendOrder(trade);
      }

      if (advice.sell &&
        this._portfolio.canSell(this.sellOrderSize, this._lastValue) &&
        this._pendingTrade === undefined) {
        this._tradeCount++;
        const trade = this.getSellOrder();
        return await this.sendOrder(trade);
      }
    }
  }

  async fetchPortfolio() {
    const result = await this._client.accountInfo();
    this.initPortfolio(result.balances);
  }

  //array
  initPortfolio(balances) {
    this._portfolio = Portfolio.portfolioFactory(balances, CURRENCY, ASSET);
    if (!this._firstPortfolioUpdate) {
      this._originalPortfolio = Portfolio.portfolioFactory(balances, CURRENCY, ASSET);
      this._firstPortfolioUpdate = true;
    }

  }

  //object
  convertAndUpdatePortfolio(balances) {
    const asArray = Object.keys(balances).reduce((acc, key) => {
      const obj = balances[key];
      const available = obj.free;
      const locked = obj.locked;
      acc.push({
        asset: key,
        free: available,
        locked: locked
      });
      return acc;
    }, []);
    this.initPortfolio(asArray);
  }

  async fetchBars(testStart) {
    //back fill things

    const endTime = typeof testStart !== 'number' ? Date.now() : testStart;
    const startTime = new Date(endTime).getTime() - (60000 * 15 * PERIOD);

    const response = await bars.fetchCandles({
      fetchAction: async (request) => {
        return await this._client.candles(request);
      },
      symbol: this._symbol,
      interval: BAR_LEN + "m",
      startTime: startTime,
      endTime: endTime,
      maxBars: PERIOD
    });

    this._allCandles = response.slice();
    this._lastUpdateTime = response[0].opentime.getTime();
    this._data = this.pluck(response, BAR_PROPERTY).map((value) => {
      return BN(value)
    });

    this._backFillIndicatorHistory();
    return Promise.resolve(this._data);
  }

  //this would be interesting to do with a reaction
  updateDataSet(candle) {
    if (this.shouldMakeNewCandle(candle)) {
      this._data.shift();
      this._data.push(BN(candle[BAR_PROPERTY]));
      this._allCandles.push(candle);
      this._handleIndicatorTick();
      this.generatePortfolioValues();
      return true;
    }
    return false;
  }

  /**
   * Iterates over the indicators and
   * generates their next tick data
   * @private
   */
  _handleIndicatorTick(){
    const numbers = this._getNumbers();
    this._indicators.forEach((indicator)=>{
      const result = indicator.generate(numbers);
      const indicatorData = this._indicatorHistory.get(indicator.name);
      indicatorData.push(result);
    });
  }


  shouldMakeNewCandle(candle) {
    //is the time of this candle a significant time from our last
    if (candle.opentime.getTime() - this._lastUpdateTime >= 1000 * 60 * BAR_LEN) {
      this._lastUpdateTime = candle.opentime.getTime();
      return true;
    }
    return false;
  }

  _returnValueOrZero(value) {
    if (value instanceof BN) {
      return value;
    }
    return typeof value !== 'number' || Number.isNaN(value) ? 0 : value;
  }

  get lastAssetTether() {
    return this._returnValueOrZero(this._lastAssetTether);
  }

  get lastCurrencyTether() {
    return this._returnValueOrZero(this._lastCurrencyTether);
  }

  //Me: you know - YOU COULD fetch these via rest and calculate the initial value of all this stuff up front instead of
  //being silly and waiting for candles. :/
  //
  //Me: Okay. But later.
  generatePortfolioValues() {
    if (config.requiresTether){
      this._generateTetheredPortfolioValues();
    }
    else{
      this._generatePortfolioValues();
    }
    this._valueHistory.push(this._currentValues);
  }

  _generatePortfolioValues(){
    const quote = BN(this._lastCandle[config.barProperty]);
    if (this._originalValue === undefined){
      this._originalValue = this._originalPortfolio.value(quote);
      this._maxInitialHodlAsset = this._originalPortfolio.currency.free.dividedBy(quote);
    }

    const tradedPortValue = this._portfolio.value(quote);
    //because we're trading usd here, hodl value is the value if we had bought all of our eth up front
    const currentHodlValue = this._maxInitialHodlAsset.times(quote);


    const tradedDiff = tradedPortValue.minus(this._originalValue);
    const heldDiff = currentHodlValue.minus(this._originalValue);

    const tradedPercentChange = this._returnValueOrZero(tradedDiff.dividedBy(this._originalValue).times(100).toNumber());
    const heldPercentChange = this._returnValueOrZero(heldDiff.dividedBy(this._originalValue).times(100).toNumber());

    this._currentValues = {
      tradedValue: tradedPortValue.toNumber(),
      holdValue: currentHodlValue.toNumber(),
      originalValue: this._originalValue === undefined ? 0 : this._originalValue.toNumber(),
      tradedPercentChange: tradedPercentChange,
      heldPercentChange: heldPercentChange,
      when: this._lastCandle.opentime.getTime()
    };
  }

  _generateTetheredPortfolioValues(){
    if (this._originalValue === undefined && this._lastAssetTether !== undefined && this._lastCurrencyTether !== undefined) {
      this._originalValue = this._originalPortfolio.tetheredValue(this.lastAssetTether, this.lastCurrencyTether);
    }

    const tradedPortValue = this._portfolio.tetheredValue(this.lastAssetTether, this.lastCurrencyTether);
    const currentHodlValue = this._originalPortfolio.tetheredValue(this.lastAssetTether, this.lastCurrencyTether);

    const tradedDiff = tradedPortValue.minus(this._originalValue);
    const heldDiff = currentHodlValue.minus(this._originalValue);

    const tradedPercentChange = this._returnValueOrZero(tradedDiff.dividedBy(this._originalValue).times(100).toNumber());
    const heldPercentChange = this._returnValueOrZero(heldDiff.dividedBy(this._originalValue).times(100).toNumber());

    this._currentValues = {
      tradedValue: tradedPortValue.toNumber(),
      holdValue: currentHodlValue.toNumber(),
      originalValue: this._originalValue === undefined ? 0 : this._originalValue.toNumber(),
      tradedPercentChange: tradedPercentChange,
      heldPercentChange: heldPercentChange,
      when: this._lastCandle.opentime.getTime()
    };

  }

  listen() {
    //listen, get a tick
    rendr.web(this); //kick off the web server
    return new Promise((f, r) => {
      this._ws.candles(this._symbol, TICK_LEN + 'm', async candle => {
        if (this.initComplete) {
          this._lastValue = BN(candle[BAR_PROPERTY]);
          this._lastCandle = candle;
          const action = this.updateDataSet(candle);
          if (action) {
            await this.trade();
          }
          this._render();
        }
      });

      //goal is still working with binance but not messing up gdax
      if (config.requiresTether){
        //get USDT for ASSET
        this._ws.candles(ASSET_TETHER, TICK_LEN + "m", (candle) => {
          this._lastAssetTether = BN(candle[BAR_PROPERTY]);
          if (this._lastCurrencyTether !== undefined) {
            this._render();
          }
        });

        this._ws.candles(CURRENCY_TETHER, TICK_LEN + "m", (candle) => {
          this._lastCurrencyTether = BN(candle[BAR_PROPERTY]);
          if (this._lastAssetTether) {
            this._render();
          }
        });
      }

      this._ws.user((msg) => {
        if (msg.eventType === "account") {
          //update portfolio?
          if (msg.balances) {
            this.convertAndUpdatePortfolio(msg.balances);
            this._pendingTrade = undefined;
          } else {
            throw new Error("No balances?");
          }
        }
      });
    });
  }

  _render() {
    //traded port value vs original value
    const currentValues = this._currentValues;
    rendr.getReady();
    rendr.set(`current: ${currentValues.tradedValue}  change: ${currentValues.tradedPercentChange}`);
    rendr.set(`hodl: ${currentValues.holdValue} change: ${currentValues.heldPercentChange}`);
    rendr.set(`original: ${this._originalValue}`);

    rendr.set(`current bar: ${moment(this._lastCandle.opentime)} total trades: ${this._tradeCount}`);
    rendr.set(`last trade: ${moment(this._lastTradeTime)} total trades: ${this._tradeCount}`);
  }
}


function go(client) {
  const bot = new Bot(client);
  return bot;
}

module.exports = go;