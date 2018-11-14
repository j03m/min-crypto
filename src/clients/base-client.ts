import BaseSocket from "./base-socket";
import Order from "../types/order";
import OrderId from "../types/order-id";
import { CandlesRequest } from "../types/candles-request";
import Candle from "../types/candle";

export default interface BaseClient {
    socket: BaseSocket,
    init():Promise<any>,
    order(trade:Order):Promise<any>,
    cancelOrder(identifier:OrderId):Promise<any>
    accountInfo():Promise<any>
    candles(candlesRequest: CandlesRequest):Promise<Array<Candle>>
}