import {Client} from "pg";
const MockPortfolio = require("../core/mock-portfolio");
import BaseClient from "./base-client";
import DBSocket from "./db-socket";
import Order from "../types/order";
import OrderId from "../types/order-id";
import TestRange from "../types/test-range";

import { CandlesRequest } from "../types/candles-request";


class DBClient implements BaseClient {
    private _postGres: Client;
    private _ws: DBSocket;
    private _mockPortfolio: any; //todo update
    constructor(options: TestRange){
        this._postGres = new Client({
            host: 'localhost',
            database: 'bot',
            user: 'postgres'
        });
        this._ws = new DBSocket(options, this._postGres);
        this._mockPortfolio = new MockPortfolio(this._accountInfoSync());
    }

    async init(){
        await this._postGres.connect();
    }

    getSymbol(asset:string, currency:string){
        return `${asset}-${currency}`;
    }

    async order(trade:Order){
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
    cancelOrder(identifier:OrderId){
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
    async candles(request:CandlesRequest){
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


module.exports = DBClient;