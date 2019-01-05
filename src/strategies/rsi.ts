
import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "rsi"
}

const RSIHigh = 60;
const RSILow = 15;

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const rsiHistory = indicators.get("rsi");
    if (rsiHistory === undefined){
        throw new Error("rsi strategy requires the rsi indicator");
    }
    const rsi = rsiHistory[rsiHistory.length-1];
    if (rsi <= RSILow){
        return true;
    }else {
        return false;
    }
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const rsiHistory = indicators.get("rsi");
    if (rsiHistory === undefined){
        throw new Error("rsi strategy requires the rsi indicator");
    }
    const rsi = rsiHistory[rsiHistory.length-1];
    if (rsi >= RSIHigh){
        return true;
    }else {
        return false;
    }
}