const {Client} = require("pg");
const MockPortfolio = require("./mock-portfolio");
const config = require("./config.js");
class dbClient {
    constructor(options){
        this._postGres = new Client({
            host: 'localhost',
            database: 'bot',
            user: 'postgres'
        });
        this._ws = new dbSocket(options, this._postGres);
        this._mockPortfolio = new MockPortfolio(this._accountInfoSync());
    }

    async initDb(){
        await this._postGres.connect();
    }

    async order(trade){
        //order should cause an execution report
        //followed by a portfolio update via the websocket
        this._mockPortfolio.mockExecute(trade);
        return this._ws.sendExecution(this._mockPortfolio.asset,
            this._mockPortfolio.currency);
        return Promise.resolve();

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
        const select = `SELECT * FROM bars where openTime >= to_timestamp($1) and openTime <= to_timestamp($2) order by openTime asc`;
        const result = await this._postGres.query({
            text: select,
            values: [request.startTime/1000, request.endTime/1000]
        });
        return result.rows;
    }

    get ws () {
        return this._ws;
    }
}

//todo: you need to download currency and asset tether data
class dbSocket{
    constructor(options, dbClient){
        this._tickStart = options.testStart;
        this._testEnd = options.testEnd;
        this._orders = 0;
        this._dbClient = dbClient;
    }
    candles(symbol, tick, cb){

        if (this._interval){
            clearInterval(this._interval);
        }

        //should tick 1 bar from db
        this._candlesCb = cb;
        this._interval = setInterval(async () => {
            const candle = await this.getNextCandle(symbol);
            if (candle === undefined){
                console.log("No ticks");
                clearInterval(this._interval)
            }
            this._candlesCb(candle);
        }, 1000);
    }

    async getNextCandle(){
        //read next candle from the db
        const select = "select * from bars where openTime >= to_timestamp($1) and openTime <= to_timestamp($2) order by openTime asc limit 1"
        const result = await this._dbClient.query({
            text: select,
            values: [this._tickStart/1000, this._testEnd/1000]
        });

        if (result.rows.length !== 0){
            this._tickStart = result.rows[0].opentime * 1000;
            return result.rows[0];
        } else {
            throw new Error("TEST DONE"); //todo: maybe be a little less ham fisted?
        }

    }
    user(cb){
        //portfolio updates
        this._userCb = cb;
    }

    sendCandle(candle){
        this._candlesCb(candle);

    }

    sendUserUpdate(update){
        this._userCb(update);
    }

    sendExecution(asset, currency){
        this._orders++;
        this.sendUserUpdate({
            eventType: "executionReport",
            orderId: this._orders
        });

        this.sendUserUpdate({
            eventType: 'account',
            eventTime: Date.now(),
            balances: {
                [config.asset]: {available: asset.toString(), locked: '0.00000000'},
                [config.currency]: {available: currency.toString(), locked: '0.00000000'}
            }
        })
    }
}

module.exports = dbClient;