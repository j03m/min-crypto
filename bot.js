const mobx = require("mobx");
const bars = require("./bars");
const bands = require("./bands");
const BN = require("bignumber.js");
const BandGenerator = require('technicalindicators').BollingerBands;
const Advice = require("./advice");
const Portfolio = require("./portfolio");
const config = require("./config");
const rendr = require("./rendr");
const moment = require("moment");


//TODO switch current and asset. You BUY the ASSET ETH with the CURRENCY BTC

const CURRENCY = config.currency;
const ASSET = config.asset;
const TETHER = config.tether;
const SYMBOL = `${CURRENCY}${ASSET}`;
const CURRENCY_TETHER = `${CURRENCY}${TETHER}`;
const ASSET_TETHER = `${ASSET}${TETHER}`;
const {decorate, observable, computed, action, reaction} = mobx;
const ORDER_SIZE = BN(config.orderSize);
const BAR_PROPERTY = config.barProperty;
const STOP_PERCENT = BN(config.stopPercent); //5%

const PERIOD = config.period;
const TICK_LEN = config.tickLen;
const BAR_LEN = config.barLen;
const WAIT_TO_TRADE = config.waitToTrade;

//j03m:
//you need to back test. pull 500 15 min bars, pick a spot at random
//feed the 15 min bars through the fake trader
//add a mock binance api that pulls candles and ticks from a file
//get crazy use postgres
//make the mock binance also handle trades
//renderer

class Bot {
    constructor(client) {
        this._data = [];
        this._client = client;
        this._ws = client.ws;
        this._trades = [];
        this._initComplete = false;
        this._lastValue = -1;
        this._currentAdvice = null;
        this._portfolio = new Portfolio({ free: 0, locked: 0}, { free: 0, locked: 0});
        this._lastTradeTime = undefined;
        this._pendingTrade = undefined;
        this._originalPortfolio == new Portfolio({ free: 0, locked: 0}, { free: 0, locked: 0});
        this._firstPortfolioUpdate = false;
        this._tradeCount = 0;
    }

    get initComplete(){
        return this._initComplete;
    }

    set initComplete(value){
        this._initComplete = value;
    }

    get pendingTrade(){
        return this._pendingTrade;
    }

    generateBands() {
        const numbers = this._data.map((value) => {
            return value.toNumber()
        });
        const stdDev2 = bands.makeBand(BandGenerator, numbers, PERIOD, 2);
        const stdDev1 = bands.makeBand(BandGenerator, numbers, PERIOD, 1);
        this._guide = bands.makeGuide(stdDev1, stdDev2);
        return this._guide;
    }

    get advice() {
        return this._currentAdvice;
    }

    generateAdvice(){
        const bands = this._guide;
        const buy = Advice.hasBuySignal(this._lastValue, bands);
        const sell = Advice.hasSellSignal(this._lastValue, bands);
        this._currentAdvice = {
            buy,
            sell
        };
    }

    shouldStopLoss(){
        if (this._lastTrade !== undefined &&
            this._lastTrade.side === "BUY") {
            const price = BN(this._lastTrade.price);
            if(this._lastValue.isLessThan(price)){
                return price.minus(this._lastValue).dividedBy(price).isGreaterThanOrEqualTo(STOP_PERCENT);
            }
        }
        return false;
    }

    async handleStopLoss(){
        if (this._portfolio.canSell(ORDER_SIZE, this._lastValue) &&
            this._pendingTrade === undefined) {
            const trade = this.getSellOrder();
            return await this.sendOrder(trade);
        }
    }

    async sendOrder(trade){
        let response;
        response = await this._client.order(trade);
        this._trades.push({
            order: trade,
            response: response
        });
        this._lastResponse = response;
        this._lastTrade = trade;
        this._lastTradeTime = this._lastCandle.opentime;
        return response;

    }

    async cancelOpenOrders(){
        const openOrders = await this._client.openOrders({
            symbol: SYMBOL
        });
        for(let i =0; i < openOrders.length; i++){
            const orderId = openOrders[i].orderId;
            await this._client.cancelOrder({
                symbol: SYMBOL,
                orderId: orderId
            });
        }
    }

    getBuyOrder(){
        this._pendingTrade = {
            symbol: SYMBOL,
            side: 'BUY',
            quantity: ORDER_SIZE.toString(),
            price: this._lastValue.toString(),
        };
        return this._pendingTrade;
    }

    pluck(data, prop){
        return data.map((item) => {
            return item[prop];
        });
    }

    getSellOrder(){
        this._pendingTrade = {
            symbol: SYMBOL,
            side: 'SELL',
            quantity: ORDER_SIZE,
            price: this._lastValue,
        };
        return this._pendingTrade;
    }

    shouldTrade() {
        return this._lastTradeTime === undefined || this._lastCandle.opentime - this._lastTradeTime > WAIT_TO_TRADE;
    }

    async trade () {
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
                this._portfolio.canBuy(ORDER_SIZE, this._lastValue) &&
                this._pendingTrade === undefined){
                this._tradeCount++;
                const trade = this.getBuyOrder();
                return await this.sendOrder(trade);
            }

            if (advice.sell &&
                this._portfolio.canSell(ORDER_SIZE, this._lastValue) &&
                this._pendingTrade === undefined){
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
    initPortfolio(balances){
        this._portfolio = Portfolio.portfolioFactory(balances, CURRENCY, ASSET);
        if (!this._firstPortfolioUpdate){
          this._originalPortfolio = Portfolio.portfolioFactory(balances, CURRENCY, ASSET);
          this._firstPortfolioUpdate = true;
        }

    }

    //object
    convertAndUpdatePortfolio(balances){
        const asArray = Object.keys(balances).reduce((acc, key) => {
            const obj = balances[key];
            const available = obj.available;
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

    //j03m you need to change this here
    //you can't use date.now. You need to receive a
    //trade start time, and then go back PERIOD bars from there
    async fetchBars(testStart) {
        //back fill things

        const endTime = typeof testStart !== 'number' ? Date.now() : testStart;
        const startTime = new Date(endTime).getTime() - (60000 * 15 * PERIOD);

        const response = await bars.fetchCandles({
            fetchAction: async (request) => {
                return await this._client.candles(request);
            },
            symbol: SYMBOL,
            interval: BAR_LEN + "m",
            startTime: startTime,
            endTime: endTime,
            maxBars: PERIOD
        });

        this._lastUpdateTime = response[0].opentime.getTime();
        this._data = this.pluck(response, BAR_PROPERTY).map((value) => { return BN(value)});

        this.generateBands();
        return Promise.resolve(this._data);
    }

    //this would be interesting to do with a reaction
    updateDataSet(candle){
        if (this.shouldMakeNewCandle(candle)){
            this._data.shift();
            this._data.push(BN(candle[BAR_PROPERTY]));
            this.generateBands();
            return true;
        }
        return false;
    }


    shouldMakeNewCandle(candle){
        //is the time of this candle a significant time from our last
        if (candle.opentime.getTime() - this._lastUpdateTime >= 1000 * 60 * BAR_LEN){
            this._lastUpdateTime = candle.opentime.getTime();
            return true;
        }
        return false;
    }

    listen() {
        //listen, get a tick
        return new Promise((f, r) => {
            this._ws.candles(SYMBOL, TICK_LEN + 'm', async candle => {
                if (this.initComplete){
                    const action = this.updateDataSet(candle);
                    this._lastValue = BN(candle[BAR_PROPERTY]);
                    this._lastCandle = candle;
                    if (action){
                        await this.trade();
                    }
                    this._render();
                }
            });

            //get USDT for ASSET
            this._ws.candles(ASSET_TETHER, TICK_LEN + "m", (candle) => {
                this._lastAssetTether = BN(candle[BAR_PROPERTY]);
                if (this._lastCurrencyTether !== undefined){
                    this._render();
                }
            });

            this._ws.candles(CURRENCY_TETHER, TICK_LEN + "m", (candle) => {
                this._lastCurrencyTether = BN(candle[BAR_PROPERTY]);
                if(this._lastAssetTether){
                    this._render();
                }
            });


            //j03m - make this sane :/
            this._ws.user((msg) => {
                if (msg.eventType === "account"){
                    //update portfolio?
                    if (msg.balances){
                        this.convertAndUpdatePortfolio(msg.balances);
                        this._pendingTrade = undefined;
                    }else {
                        throw new Error("No balances?");
                    }
                }
            });
        });
    }

    _render(){
        if (this._firstRender === undefined &&
            this._lastAssetTether !== undefined &&
            this._lastCurrencyTether !== undefined){
            //capture the total value of the original portfolio once
            this._originalValue = this._originalPortfolio.value(this._lastAssetTether, this._lastCurrencyTether);
            this._firstRender = true;
        }

        if (this._firstRender){
          const tradedPortValue = this._portfolio.value(this._lastAssetTether, this._lastCurrencyTether);
          const currentHodlValue = this._originalPortfolio.value(this._lastAssetTether, this._lastCurrencyTether);

          const tradedDiff = tradedPortValue.minus(this._originalValue);
          const heldDiff = currentHodlValue.minus(this._originalValue);

          const tradedPercentChange = tradedDiff.dividedBy(this._originalValue).times(100);
          const heldPercentChange = heldDiff.dividedBy(this._originalValue).times(100);


          //traded port value vs original value
          rendr.getReady();
          rendr.set(`current: ${tradedPortValue.toNumber()}  change: ${tradedPercentChange}`);
          rendr.set(`hodl: ${currentHodlValue.toNumber()} change: ${heldPercentChange}`);
          rendr.set(`original: ${this._originalValue.toNumber()}`);
          rendr.set(`current bar: ${moment(this._lastCandle.opentime)} total trades: ${this._tradeCount}`);
          rendr.set(`last trade: ${moment(this._lastTradeTime)} total trades: ${this._tradeCount}`);
        }
    }
}





function go(client){
    const bot = new Bot(client);
    return bot;
}

module.exports = go;