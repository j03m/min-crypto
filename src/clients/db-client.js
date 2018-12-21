"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const MockPortfolio = require("../core/mock-portfolio");
const db_socket_1 = require("./db-socket");
class DBClient {
    constructor(options) {
        this._postGres = new pg_1.Client({
            host: 'localhost',
            database: 'bot',
            user: 'postgres'
        });
        this._ws = new db_socket_1.default(options, this._postGres);
        this._initialBalance = options.balance;
        this._mockPortfolio = new MockPortfolio(this._initialBalance);
    }
    async init() {
        await this._postGres.connect();
    }
    getSymbol(asset, currency) {
        return `${asset}-${currency}`;
    }
    async order(trade) {
        //order should cause an execution report
        //followed by a portfolio update via the websocket
        this._mockPortfolio.mockExecute(trade);
        //j03m when we do this, porfolio becomes all NaN
        return this._ws._sendExecution(this._mockPortfolio.asset, this._mockPortfolio.currency);
    }
    openOrders() {
        return Promise.resolve([]);
    }
    cancelOrder(identifier) {
        return Promise.resolve();
    }
    accountInfo() {
        return Promise.resolve(this._initialBalance);
    }
    async candles(request) {
        //look at start and end times, convert to seconds
        //select from bars where between start, end
        const select = `SELECT * FROM bars where openTime >= to_timestamp($1) and openTime <= to_timestamp($2) and symbol = $3 order by openTime asc`;
        const result = await this._postGres.query({
            text: select,
            values: [request.startTime / 1000, request.endTime / 1000, request.symbol]
        });
        return result.rows;
    }
    get ws() {
        return this._ws;
    }
}
exports.default = DBClient;
//# sourceMappingURL=db-client.js.map