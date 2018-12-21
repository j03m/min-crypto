"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../utils/util");
const axios = require("axios");
function makeSymbol(asset, currency) {
    return `${asset}-${currency}`;
}
const ReconnectingWebSocket = require("reconnecting-websocket");
const WS = require("ws");
class GdaxClient {
    constructor(credentials) {
        //todo: j03m uncomment me, why does this discon and throw?
        this.socket = new ReconnectingWebSocket(credentials.websocketUri, [], {
            WebSocket: WS
        });
        this.socket.addEventListener("message", this._messageHandler.bind(this));
        this.socket.addEventListener("error", (e) => {
            //todo: you will need to reconnect on timeout
            console.log("gdax socket error:", e);
        });
        this.socket.addEventListener("close", () => {
            console.log("gdax socket close!");
        });
        this.socket.addEventListener("open", () => {
        });
        this.apiUri = credentials.apiUri;
    }
    init() {
        return Promise.resolve();
    }
    getSymbol(asset, currency) {
        return `${asset}-${currency}`;
    }
    _messageHandler(message) {
        const payload = JSON.parse(message.data);
        if (payload.type === "ticker") {
            const symbol = payload.product_id;
            const handler = this.tickHandlers.get(symbol);
            if (handler) {
                handler(payload);
            }
            else {
                const msg = `Why are we getting ticks for ${symbol} if we never registered?`;
                console.log(msg);
            }
        }
        else if (payload.type === "user") {
            console.log("User message:", payload);
        }
        else {
            console.log("Unknown message:", payload);
        }
    }
    order(order) {
        //?? rest api trade?
        return Promise.reject(new Error("not implemented"));
    }
    accountInfo() {
        //?? rest api account info?
        return Promise.reject(new Error("not implemented"));
    }
    cancelOrder() {
        return Promise.resolve();
    }
    async candles(candleRequest) {
        const start = new Date(candleRequest.startTime).toISOString();
        const end = new Date(candleRequest.endTime).toISOString();
        const expandedInterval = util_1.expandInterval(candleRequest.interval);
        const granularity = expandedInterval.cost / 1000;
        const symbol = candleRequest.symbol;
        const url = `${this.apiUri}/products/${symbol}/candles?start=${start}&end=${end}&granularity=${granularity}`;
        let response;
        try {
            response = await axios.get(url);
        }
        catch (ex) {
            console.log(`request for ${url} failed with:`, ex);
            throw ex;
        }
        //transform request?
        return this.gdaxCandleArrayToCandleArray(symbol, response.data);
    }
    gdaxCandleArrayToCandleArray(symbol, candleArrays) {
        return candleArrays.map((candleArray) => {
            //[ time, low, high, open, close, volume ]
            return {
                opentime: new Date(candleArray[0] * 1000),
                symbol: symbol,
                open: candleArray[3].toString(),
                high: candleArray[2].toString(),
                low: candleArray[1].toString(),
                close: candleArray[4].toString(),
                volume: candleArray[5].toString()
            };
        });
    }
    get ws() {
        return {
            //tick is accepted for consistency but is ignored
            candles: (asset, currency, interval, cb) => {
                const symbol = makeSymbol(asset, currency);
                this.tickHandlers.set(symbol, cb);
                const payload = JSON.stringify({
                    "type": "subscribe",
                    "channels": [{
                            "name": "ticker",
                            "product_ids": [symbol]
                        }]
                });
                this.socket.send(payload);
            },
            user: (cb) => {
                this.userMessageHandler = cb;
                this.socket.send(JSON.stringify({
                    "type": "subscribe",
                    "channels": [{
                            "name": "user",
                            "product_ids": ["ETH-EUR"]
                        }]
                }));
            }
        };
    }
}
module.exports = GdaxClient;
//# sourceMappingURL=gdax-client.js.map