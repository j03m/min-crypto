"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../core/config");
class DBSocket {
    constructor(options, postGres) {
        this._tickStart = options.testStart;
        this._testEnd = options.testEnd;
        this._orders = 0;
        this._postGres = postGres;
        this._callBacks = new Map();
    }
    candles(symbol, tick, cb) {
        this._callBacks.set(symbol, cb);
        if (this._interval === undefined) {
            const that = this;
            async function handler() {
                clearInterval(that._interval);
                await that._sendCandles();
                that._interval = setInterval(handler.bind(that), config_1.default.tick);
            }
            this._interval = setInterval(handler.bind(this), config_1.default.tick);
        }
    }
    async _sendCandles() {
        const ary = Array.from(this._callBacks.entries());
        let candle;
        for (let i = 0; i < ary.length; i++) {
            const symbol = ary[i][0];
            const cb = ary[i][1];
            candle = await this._getNextCandle(symbol);
            cb(candle);
        }
        if (candle === undefined) {
            throw new Error("Couldn't find candle");
        }
        else {
            //use the LAST candle to update time
            this._tickStart = candle.opentime.getTime();
        }
    }
    async _getNextCandle(symbol) {
        //read next candle from the db
        const select = "select * from bars where openTime > to_timestamp($1) and openTime <= to_timestamp($2) and symbol = $3 order by openTime asc limit 1";
        const result = await this._postGres.query({
            text: select,
            values: [this._tickStart / 1000, this._testEnd / 1000, symbol]
        });
        if (result.rows.length !== 0) {
            return result.rows[0];
        }
        else {
            console.log("last query:", {
                text: select,
                values: [this._tickStart / 1000, this._testEnd / 1000, symbol]
            });
            throw new Error("TEST DONE"); //todo: maybe be a little less ham fisted?
        }
    }
    user(cb) {
        //portfolio updates
        this._userCb = cb;
    }
    _sendUserUpdate(update) {
        this._userCb(update);
    }
    _sendExecution(asset, currency) {
        this._orders++;
        this._sendUserUpdate({
            eventType: "executionReport",
            orderId: this._orders
        });
        this._sendUserUpdate({
            eventType: 'account',
            eventTime: Date.now(),
            balances: {
                [config_1.default.asset]: { free: asset.free.toString(), locked: '0.00000000' },
                [config_1.default.currency]: { free: currency.free.toString(), locked: '0.00000000' }
            }
        });
    }
}
exports.default = DBSocket;
//# sourceMappingURL=db-socket.js.map