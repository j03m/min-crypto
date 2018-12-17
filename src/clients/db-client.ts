import {Client} from "pg";
const MockPortfolio = require("../core/mock-portfolio");
import BaseClient from "./base-client";
import DBSocket from "./db-socket";
import Order from "../types/order";
import OrderId from "../types/order-id";
import BackTestOptions from "../types/back-test-options";

import { CandlesRequest } from "../types/candles-request";
import {AccountInfo} from "../types/portfolio-types";


export default class DBClient implements BaseClient {
    private _postGres: Client;
    private _ws: DBSocket;
    private _mockPortfolio: any; //todo update
    private _initialBalance: AccountInfo;
    constructor(options: BackTestOptions){
        this._postGres = new Client({
            host: 'localhost',
            database: 'bot',
            user: 'postgres'
        });
        this._ws = new DBSocket(options, this._postGres);
        this._initialBalance = options.balance;
        this._mockPortfolio = new MockPortfolio(this._initialBalance);
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

    accountInfo(){
        return Promise.resolve(this._initialBalance);
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

