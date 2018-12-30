import Candle from "./candle";

export default interface Strategy {
    name:string,
    shouldBuy:(indicatorMap:Map<string, Array<any>>, prices:Array<Candle>) => boolean,
    shouldSell:(indicatorMap:Map<string, Array<any>>, prices:Array<Candle>) => boolean,
}