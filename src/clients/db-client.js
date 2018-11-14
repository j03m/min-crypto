const {Client} = require("pg");
const MockPortfolio = require("./mock-portfolio");
const config = require("./config.js");
class DBClient {
    constructor(options){
        this._postGres = new Client({
            host: 'localhost',
            database: 'bot',
            user: 'postgres'
        });
        this._ws = new dbSocket(options, this._postGres);
        this._mockPortfolio = new MockPortfolio(this._accountInfoSync());
    }

    async init(){
        await this._postGres.connect();
    }

    async order(trade){
        //order should cause an execution report
        //followed by a portfolio update via the websocket
        this._mockPortfolio.mockExecute(trade);

        //j03m when we do this, porfolio becomes all NaN
        return this._ws._sendExecution(this._mockPortfolio.asset,
            this._mockPortfolio.currency);

    }
    openOrders(){
        return Promise.resolve([])

    }
    cancelOrder(){
        return Promise.resolve();
    }
    //This is called upfront. All our back tests
    //user 1:1. If you want to change that, edit this.
    //todo config file one day?
    accountInfo(){
        return Promise.resolve(this._accountInfoSync());
    }
    _accountInfoSync(){
        return {
            makerCommission: 10,
            takerCommission: 10,
            buyerCommission: 0,
            sellerCommission: 0,
            canTrade: true,
            canWithdraw: true,
            canDeposit: true,
            balances: [
                { asset: 'BTC', free: '1.00000000', locked: '0.00000000' },
                { asset: 'ETH', free: '1.00000000', locked: '0.00000000' },
            ]
        };
    }
    async candles(request){
        //look at start and end times, convert to seconds
        //select from bars where between start, end
        const select = `SELECT * FROM bars where openTime >= to_timestamp($1) and openTime <= to_timestamp($2) and symbol = $3 order by openTime asc`;
        const result = await this._postGres.query({
            text: select,
            values: [request.startTime/1000, request.endTime/1000, request.symbol]
        });
        return result.rows;
    }

    get ws () {
        return this._ws;
    }
}

//todo: we need a base clase :/
class dbSocket{
    constructor(options, dbClient){
        this._tickStart = options.testStart;
        this._testEnd = options.testEnd;
        this._orders = 0;
        this._dbClient = dbClient;
        this._callBacks = new Map();
    }
    candles(symbol, tick, cb){

        this._callBacks.set(symbol, cb);
        if (this._interval === undefined) {
                async function handler () {
                    clearInterval(this._interval);
                    await this._sendCandles();
                  this._interval = setInterval(handler.bind(this), config.tick);
                }
            this._interval = setInterval(handler.bind(this), config.tick);
        }
    }

    async _sendCandles(){
        const ary = Array.from(this._callBacks.entries());
        let candle;
        for(let i = 0; i < ary.length; i++){
            const symbol = ary[i][0];
            const cb = ary[i][1];
            candle = await this._getNextCandle(symbol);
            cb(candle);
        }
        //use the LAST candle to update time
        this._tickStart = candle.opentime.getTime();
    }

    async _getNextCandle(symbol){
        //read next candle from the db
        const select = "select * from bars where openTime > to_timestamp($1) and openTime <= to_timestamp($2) and symbol = $3 order by openTime asc limit 1"
        const result = await this._dbClient.query({
            text: select,
            values: [this._tickStart/1000, this._testEnd/1000, symbol]
        });

        if (result.rows.length !== 0){
            return result.rows[0];
        } else {
            console.log("last query:", {
              text: select,
              values: [this._tickStart/1000, this._testEnd/1000, symbol]
            })
            throw new Error("TEST DONE"); //todo: maybe be a little less ham fisted?
        }

    }
    user(cb){
        //portfolio updates
        this._userCb = cb;
    }


    _sendUserUpdate(update){
        this._userCb(update);
    }

    _sendExecution(asset, currency){
        this._orders++;
        this._sendUserUpdate({
            eventType: "executionReport",
            orderId: this._orders
        });

        this._sendUserUpdate({
            eventType: 'account',
            eventTime: Date.now(),
            balances: {
                [config.asset]: {available: asset.free.toString(), locked: '0.00000000'},
                [config.currency]: {available: currency.free.toString(), locked: '0.00000000'}
            }
        })
    }
}

module.exports = DBClient;