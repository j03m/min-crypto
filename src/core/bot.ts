import {BuySellStrategy} from "./config";
import Position from "../types/position";
import Order from "../types/order";
import BigNumber from "bignumber.js";
import Indicator from "../types/indicator";
import Strategy, {StrategyApi} from "../types/strategy";
import BaseClient from "../clients/base-client";
import BaseSocket from "../clients/base-socket";
import Candle from "../types/candle";

const BN = BigNumber;
const config = require("./config").default;
const indicatorConfig = config.indicators;
const strategyConfig =  config.strategies;
const bars = require("./bars");

const Portfolio = require("./portfolio");
const rendr = require("../vis/rendr");
const moment = require("moment");

//TODO switch current and asset. You BUY the ASSET ETH with the CURRENCY BTC

const CURRENCY = config.currency;
const ASSET = config.asset;
let CURRENCY_TETHER;
let ASSET_TETHER;
const ORDER_SIZE = BN(config.orderSize);
const BAR_PROPERTY = config.barProperty;

const PERIOD = config.period;
const TICK_LEN = config.tickLen;
const BAR_LEN = config.barLen;
const WAIT_TO_TRADE = config.waitToTrade;

const assert = require("assert");

class Bot {
    positions: Set<Position>;
    indicators: Array<Indicator>;
    strategies: Map<string, Strategy>;
    indicatorHistory: Map<string, Array<any>>;
    client:BaseClient;
    ws: BaseSocket;
    allCandles:Array<Candle>;
    constructor(client: BaseClient) {
        this.client = client;
        this.ws = client.ws;
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
        this.allCandles = [];
        this._valueHistory = [];
        this._symbol = this.client.getSymbol(config.asset, config.currency);
        if (config.requiresTether) {
            CURRENCY_TETHER = this.client.getSymbol(config.currency, config.tether);
            ASSET_TETHER = this.client.getSymbol(config.asset, config.tether);
        }
        this.positions = new Set<Position>();
        this.indicators = this._hydrateIndicators();
        this.strategies = this._hydrateStrategies();
        this.indicatorHistory = new Map<string, Array<any>>();
    }

    /**
     * Iterates over the list of indicator files, requires them
     * and sets them up by name
     * @returns {*}
     * @private
     */
    _hydrateIndicators(): Array<Indicator> {
        return indicatorConfig.map((indicatorFile:string) => {
            return require(`../indicators/${indicatorFile}`).default;
        });
    }

    /**
     * Iterate over strategies and require them in. This will
     * create an array of arrays of strategies.
     */
    _hydrateStrategies(): Map<string,Strategy> {
        return strategyConfig.reduce((strategyMap:Map<string,Strategy>, entry:Array<string>):Map<string,Strategy> => {
            return entry.reduce((strategyMapInner:Map<string,Strategy>, strategyFile:string):Map<string,Strategy> => {
                const strategy:Strategy = require(`../strategies/${strategyFile}`).default;
                strategyMapInner.set(strategy.name, strategy);
                return strategyMapInner
            }, strategyMap);
        }, new Map<string, Strategy>())
    }


    /**
     * Indicator array's need to match the data in length
     * so here we init the history array to the lenght of data
     * retrieved at initial fetch
     * @private
     */
    _backFillIndicatorHistory() {
        this.indicators.forEach((indicator:Indicator) => {
            const result = indicator.generate(this.allCandles);
            this.indicatorHistory.set(indicator.name,
                this.allCandles.map(() => {
                    return result;
                }));
        });
    }

    get history() {
        return {
            candles: this.candles,
            indicators: this.indicatorHistory,
            trades: this.trades
        }
    }

    get valueHistory() {
        return this._valueHistory;
    }

    //history
    get candles() {
        return this.allCandles;
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

    get buyOrderSize() {

        if (config.buySellStategy === BuySellStrategy.allInAllOut) {
            let decimalPlaces = config.decimalPlaces;
            let free = this._portfolio.currency.free;
            let check = this._portfolio.currency.free.plus(1);
            let orderSize;
            //joe what are you doing here?
            //well, I found that (value/price) * price != value :/ yay computers.
            //so I check if the result is greater then free and increase decimal places until it is
            do{
                check = free.dividedBy(this._lastValue).decimalPlaces(decimalPlaces).times(this._lastValue);
                orderSize = free.dividedBy(this._lastValue).decimalPlaces(decimalPlaces);
                decimalPlaces++;
            }while(check.isGreaterThan(free));
            assert(orderSize !== undefined);
            return orderSize;
        } else {
            return ORDER_SIZE;
        }
    }

    get sellOrderSize() {
        if (config.buySellStategy === BuySellStrategy.balanced) {
            return ORDER_SIZE;
        } else if (config.buySellStategy === BuySellStrategy.nibbleAndFlush) {
            return this._portfolio.asset.free;
        } else if (config.buySellStategy === BuySellStrategy.allInAllOut) {
            return this._portfolio.asset.free;
        }
    }

    _reduceStrategiesFor(method:string) {
        //iterate over the strategies in the config, each of which is
        //an array of names. If any array's ORed together are true, the whole thing is true
        return strategyConfig.reduce((accumulator:boolean, arrayOfStrategies:Array<string>) => {
            //strategies are ANDed together in a given array of names.
            return accumulator || arrayOfStrategies.reduce((subAccumulator: boolean, name:string):boolean => {
                const strategy:Strategy|undefined = this.strategies.get(name);
                if (strategy === undefined){
                    throw new Error(`Cannot find strategy ${name}`);
                }
                const strategyImpl:StrategyApi = strategy[method] as StrategyApi;
                return subAccumulator && strategyImpl(this.indicatorHistory, this.allCandles);
            }, true);
        }, false);
    }

    generateAdvice() {
        const buy = this._reduceStrategiesFor("shouldBuy");
        const sell = this._reduceStrategiesFor("shouldSell");
        this._currentAdvice = {
            buy,
            sell
        }
    }

    async sendOrder(trade) {
        //j03m store here - render orders
        let response;
        response = await this.client.order(trade);
        this._trades[trade.when.getTime()] = trade;
        this._lastResponse = response;
        this._lastTrade = trade;
        this._lastTradeTime = this._lastCandle.opentime;
        return response;

    }

    async cancelOpenOrders() {
        const openOrders = await this.client.openOrders({
            symbol: this._symbol
        });
        for (let i = 0; i < openOrders.length; i++) {
            const orderId = openOrders[i].orderId;
            await this.client.cancelOrder({
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

    getSellOrder(quantity?:BigNumber) {
        this._pendingTrade = {
            symbol: this._symbol,
            side: 'SELL',
            quantity: quantity !== undefined ? quantity.toString() : this.sellOrderSize.toString(),
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

    removeOpenPositions(trade:Order){
        let quantity:BigNumber = BN(trade.quantity);
        const removals:Set = new Set();
        for(let position of this.positions){
            if (quantity.isEqualTo(0)){
                break;
            }
            else if (position.quantity.isGreaterThanOrEqualTo(quantity)){
                position.quantity = position.quantity.minus(quantity);
                if (position.quantity.isEqualTo(0)){
                    removals.add(position);
                }
            }
            else if (position.quantity.isLessThan(quantity)){
                removals.add(position);
                quantity = quantity.minus(position.quantity);
            }
        }

        for (let removal of removals){
            this.positions.delete(removal);
        }

    }

    async fetchPortfolio() {
        const result = await this.client.accountInfo();
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
                return await this.client.candles(request);
            },
            symbol: this._symbol,
            interval: BAR_LEN + "m",
            startTime: startTime,
            endTime: endTime,
            maxBars: PERIOD
        });

        this.allCandles = response.slice();
        this._lastUpdateTime = response[0].opentime.getTime();
        this._backFillIndicatorHistory();
        return Promise.resolve(this.allCandles);
    }

    //this would be interesting to do with a reaction
    updateDataSet(candle: Candle) {
        if (this.shouldMakeNewCandle(candle)) {
            this.allCandles.push(candle);
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
    _handleIndicatorTick() {
        this.indicators.forEach((indicator) => {
            const result = indicator.generate(this.allCandles);
            const indicatorData:Array<any>|undefined = this.indicatorHistory.get(indicator.name);
            if (indicatorData === undefined){
                throw new Error(`Invalid config, can't find: ${indicator.name}`);
            }
            indicatorData.push(result);
        });
    }


    shouldMakeNewCandle(candle:Candle) {
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
        if (config.requiresTether) {
            this._generateTetheredPortfolioValues();
        } else {
            this._generatePortfolioValues();
        }
        this._valueHistory.push(this._currentValues);
    }

    _generatePortfolioValues() {
        const quote = BN(this._lastCandle[config.barProperty]);
        if (this._originalValue === undefined) {
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

    _generateTetheredPortfolioValues() {
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
            this.ws.candles(this._symbol, TICK_LEN + 'm', async candle => {
                if (this.initComplete) {
                    this._lastValue = BN(candle[BAR_PROPERTY]);
                    this._lastCandle = candle;
                    const action = this.updateDataSet(candle);
                    this._checkPositionsAgainstPrice(this._lastValue);
                    if (action) {
                        await this.trade();
                    }
                    this._render();
                }
            });

            //goal is still working with binance but not messing up gdax
            if (config.requiresTether) {
                //get USDT for ASSET
                this.ws.candles(ASSET_TETHER, TICK_LEN + "m", (candle) => {
                    this._lastAssetTether = BN(candle[BAR_PROPERTY]);
                    if (this._lastCurrencyTether !== undefined) {
                        this._render();
                    }
                });

                this.ws.candles(CURRENCY_TETHER, TICK_LEN + "m", (candle) => {
                    this._lastCurrencyTether = BN(candle[BAR_PROPERTY]);
                    if (this._lastAssetTether) {
                        this._render();
                    }
                });
            }

            this.ws.user((msg) => {
                if (msg.eventType === "account") {
                    //update portfolio?
                    if (msg.balances) {
                        this.convertAndUpdatePortfolio(msg.balances);
                        this._pendingTrade = undefined;
                    } else {
                        throw new Error("No balances?");
                    }
                }
                if (msg.eventType === "executionReport" && msg.order.side === "BUY") {
                    //hold open positions
                    this._addPosition(msg.order);
                }

                if (msg.eventType === "executionReport" && msg.order.side === "SELL"){
                    this.removeOpenPositions(msg.order);
                }
            });
        });
    }

    _checkPosition(position: Position, price: BigNumber):Boolean {
        const originalValue = position.quantity.times(position.price);
        const currentValue = position.quantity.times(price);
        const difference = currentValue.minus(originalValue);
        if (difference.isLessThan(0)) {
            const percent = difference.times(-1).dividedBy(originalValue).times(100);
            if (percent.isGreaterThanOrEqualTo(config.stopPercent)) {
                return true;
            }
        }
        return false;
    }

    async _checkPositionsAgainstPrice(price: BigNumber) {
        for(let position of this.positions){
            if (this._checkPosition(position, price)) {
                await this._liquidatePosition(position);
            }
        }
    }

    /**
     * sell position quantity
     * @param position
     * @private
     */
    async _liquidatePosition(position:Position){
        assert(this._portfolio.canSell(position.quantity), "we have a position here, so we should have the shares!");
        const trade = this.getSellOrder(position.quantity);
        return await this.sendOrder(trade);
    }

    _addPosition(order: Order) {
        const position = {
            quantity: BN(order.quantity),
            price: BN(order.price)
        };
        this.positions.add(position);
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