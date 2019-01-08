import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "atr"
}

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return range(indicators, candles, 20);
}

function range(indicators:Map<string, Array<any>>, candles:Array<Candle>, range: number):boolean {
    const atr = indicators.get("atr");
    if (atr === undefined){
        throw new Error("atr strategy requires the atr indicator");
    }
    const currentAtr = atr[atr.length-1];
    if (currentAtr > range){
        return true;
    }
    return false
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return range(indicators, candles, 5);
}

//todo: create a new strategy - that is ATR out of range
//Look back at all the ATR ticks. Get an average of all those ticks
//Determine if the current tick is X% above the average, if so trade