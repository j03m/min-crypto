import BaseSocket from "./base-socket";
import {Client} from "pg";
import config from "../core/config";
import Candle from "../types/candle";
import BackTestOptions from "../types/back-test-options";
import Update, {UpdateHandler} from "../types/update";
import {Balance} from "../types/portfolio-types";
import Order from "../types/order";
interface handler {
    (candle:Candle):void
}


export default class DBSocket implements BaseSocket{
    private _tickStart: number;
    private _testEnd: number;
    private _orders: number;
    private _postGres: Client;
    private _callBacks: Map<string, handler>;
    private _interval: any;
    private _userCb:UpdateHandler;

    constructor(options: BackTestOptions, postGres: Client){
        this._tickStart = options.testStart;
        this._testEnd = options.testEnd;
        this._orders = 0;
        this._postGres = postGres;
        this._callBacks = new Map();
    }

    candles(symbol:string, tick:string, cb:handler):void{
        this._callBacks.set(symbol, cb);
        if (this._interval === undefined) {
            const that:DBSocket = this;
            async function handler () {
                clearInterval(that._interval);
                await that._sendCandles();
                that._interval = setInterval(handler.bind(that), config.tick);
            }
            this._interval = setInterval(handler.bind(this), config.tick);
        }
    }

    async _sendCandles():Promise<void>{
        const ary = Array.from(this._callBacks.entries());
        let candle;
        for(let i = 0; i < ary.length; i++){
            const symbol = ary[i][0];
            const cb = ary[i][1];
            candle = await this._getNextCandle(symbol);
            cb(candle);
        }
        if (candle === undefined){
            throw new Error("Couldn't find candle");
        }
        else {
            //use the LAST candle to update time
            this._tickStart = candle.opentime.getTime();
        }
    }

    async _getNextCandle(symbol:string):Promise<Candle>{
        //read next candle from the db
        const select = "select * from bars where openTime > to_timestamp($1) and openTime <= to_timestamp($2) and symbol = $3 order by openTime asc limit 1"
        const result = await this._postGres.query({
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
            console.log("TEST DONE"); //todo: maybe be a little less ham fisted?
            const p = new Promise(()=>{});
            return await p; //pause forever
        }

    }
    user(cb:UpdateHandler){
        //portfolio updates
        this._userCb = cb;
    }


    _sendUserUpdate(update:Update){
        this._userCb(update);
    }

    _sendExecution(asset:Balance, currency:Balance, orderId:number, trade:Order){
        this._sendUserUpdate({
            eventType: "executionReport",
            eventTime: Date.now(),
            orderId: orderId,
            order: trade
        });

        this._sendUserUpdate({
            eventType: 'account',
            eventTime: Date.now(),
            balances: {
                [config.asset]: {free: asset.free.toString(), locked: '0.00000000'},
                [config.currency]: {free: currency.free.toString(), locked: '0.00000000'}
            }
        })
    }
}