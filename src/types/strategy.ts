import Candle from "./candle";
import Order from "./order";

export interface StrategyApi {
    (indicatorMap:Map<string, Array<any>>, prices:Array<Candle>):boolean
}

export interface OrderApi {
    (order:Order):void
}

export default interface Strategy {
    [index:string]: string| StrategyApi | OrderApi | undefined,
    name:string,
    shouldBuy: StrategyApi,
    shouldSell:StrategyApi,
    orderPlaced:OrderApi | undefined
}