import Candle from "../types/candle";
import PSAR from "./psar"
export default {
    shouldBuy,
    shouldSell,
    name: "inverted-psar"
}

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
   return !PSAR.shouldBuy(indicators, candles);
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return !PSAR.shouldSell(indicators, candles);
}