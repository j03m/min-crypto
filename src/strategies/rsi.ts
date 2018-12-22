import config from "../core/config";

export default {
    shouldBuy,
    shouldSell,
    name: "rsi"
}

function shouldBuy(indicators:Map<string, Array<any>>, prices:Array<number>):boolean{
    const rsiHistory = indicators.get("rsi");
    if (rsiHistory === undefined){
        throw new Error("rsi strategy requires the rsi indicator");
    }
    const rsi = rsiHistory[rsiHistory.length-1];
    if (rsi <= config.RSILow){
        return true;
    }else {
        return false;
    }
}

function shouldSell(indicators:Map<string, Array<any>>, prices:Array<number>):boolean{
    const rsiHistory = indicators.get("rsi");
    if (rsiHistory === undefined){
        throw new Error("rsi strategy requires the rsi indicator");
    }
    const rsi = rsiHistory[rsiHistory.length-1];
    if (rsi >= config.RSIHigh){
        return true;
    }else {
        return false;
    }
}