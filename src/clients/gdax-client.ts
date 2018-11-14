import ApiPackage from "../types/api-package";
import Candle from "../types/candle";
import CandleHandler from "../types/candle-handler";
import BaseClient from "./base-client";
import { CandlesRequest } from "../types/candles-request";
import Order from "../types/order";
import { expandInterval, ExpandedInterval } from "../utils/util";
const axios = require("axios");


function makeSymbol(asset: string, currency: string): string {
    return `${asset}-${currency}`;
}


const ReconnectingWebSocket = require("reconnecting-websocket");
const WS = require("ws");
// const publicClient = new Gdax.PublicClient(apiURI);
// const authedClient = new Gdax.AuthenticatedClient(
//   creds.key,
//   creds.secret,
//   creds.passphrase,
//   apiURI
// );


//todo: get public api working
//todo: figure out the guts of auth (can"t be that hard)

/**
 * Receives a loose object from websocket, returns void
 */
interface MessageHandler {
    (data: GdaxMessage): void
}

interface Listener {
    (eventName: string, responder: MessageHandler): void
}

interface socketPayload {
    (payload: string): void
}

interface Socket {
    addEventListener: Listener,
    send: socketPayload
}

interface GdaxMessage {
    product_id: string
    data: string
}

interface GdaxMatchTick {
    "time": string,
    "product_id": string,
    "price": string
}



class GdaxClient implements BaseClient {
    private tickHandlers: Map<string, CandleHandler>;
    private userMessageHandler: MessageHandler;
    public socket: Socket;
    private apiUri: string;

    public constructor(credentials: ApiPackage) {
        this.socket = new ReconnectingWebSocket(credentials.websocketUri, [], {
            WebSocket: WS
        });
        this.socket.addEventListener("message", this._messageHandler.bind(this));
        this.socket.addEventListener("error", (e) => {
            //todo: you will need to reconnect on timeout
            throw e;
        });
        this.socket.addEventListener("close", () => {
            throw new Error("Unexpected websocket close");
        });
        this.socket.addEventListener("open", () => {
        });

        this.apiUri = credentials.apiUri
    }

    public init(){
        return Promise.resolve();
    }

    private _messageHandler(message: GdaxMessage) {
        const payload = JSON.parse(message.data);
        if (payload.type === "ticker") {
            const symbol: string = payload.product_id;
            const handler: CandleHandler | undefined = this.tickHandlers.get(symbol);
            if (handler) {
                handler(payload);
            }
            else {
                const msg = `Why are we getting ticks for ${symbol} if we never registered?`;
                console.log(msg)
            }
        }
        else if (payload.type === "user") {
            console.log("User message:", payload);
        }
        else {
            console.log("Unknown message:", payload);
        }
    }

    public order(order: Order):Promise<any> {
        //?? rest api trade?
        return Promise.reject(new Error("not implemented"));
    }

    public accountInfo(): Promise<any> {
        //?? rest api account info?
        return Promise.reject(new Error("not implemented"));
    }

    public cancelOrder(){
        return Promise.resolve();
    }

    async candles(candleRequest: CandlesRequest): Promise<Array<Candle>> {
        //todo: j03m implement the candle request to Gdax
        //then move dbclient to types
        //then wrap binance client ?? maybe?
        //then back test USD
        //then move BOT to types and Gdax
        //run

        const start:string = new Date(candleRequest.startTime).toISOString();
        const end:string = new Date(candleRequest.endTime).toISOString();
        const expandedInterval:ExpandedInterval = expandInterval(candleRequest.interval);
        const granularity:number = expandedInterval.cost/1000;
        const symbol = candleRequest.symbol;
        const url:string = `${this.apiUri}/products/${symbol}/candles?start=${start}&end=${end}&granularity=${granularity}`;
        const response = await axios.get(url);

        //transform request?
        return this.gdaxCandleArrayToCandleArray(symbol, response.data);

    }

    gdaxCandleArrayToCandleArray(symbol: string, candleArrays:any):Array<Candle>{
        return candleArrays.map((candleArray: any) => {
            //[ time, low, high, open, close, volume ]
            return {
                opentime : new Date(candleArray[0]),
                symbol: symbol,
                open: candleArray[3].toString(),
                high: candleArray[2].toString(),
                low: candleArray[1].toString(),
                close: candleArray[4].toString(),
                volume: candleArray[5].toString()
            }
        });
    }

    get ws() {
        return {
            //tick is accepted for consistency but is ignored
            candles: (asset: string, currency: string, interval: string, cb: CandleHandler) => {
                const symbol: string = makeSymbol(asset, currency);
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
            user: (cb: MessageHandler) => {
                this.userMessageHandler = cb;
                this.socket.send(JSON.stringify({
                    "type": "subscribe",
                    "channels": [{
                        "name": "user",
                        "product_ids": ["ETH-EUR"]
                    }]
                }));

            }
        }
    }
}

module.exports = GdaxClient;