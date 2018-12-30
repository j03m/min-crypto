import Candle from "./candle";

export interface StrategyApi {
    (indicatorMap:Map<string, Array<any>>, prices:Array<Candle>):boolean
}

export default interface Strategy {
    [index:string]: string| StrategyApi,
    name:string,
    shouldBuy: StrategyApi,
    shouldSell:StrategyApi,
}