import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "atr-range"
}

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return outOfRange(indicators, candles);
}

function outOfRange(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean {
    const atr = indicators.get("atr");
    if (atr === undefined){
        throw new Error("atr strategy requires the atr indicator");
    }

    const poppedAtr = atr.slice();
    const currentAtr = poppedAtr.pop();

    const avg = poppedAtr.reduce((acc, atrEntry) => {
        return acc + atrEntry;
    }, 0) / poppedAtr.length;

    const diff = Math.abs(avg - currentAtr) / avg;
    const percent = diff * 100;

    if (percent >= 40){
        return true;
    }
    return false
}

/**
 * Note we only check when the bands are out of range on a buy opportunity. We're
 * trying to mix this with quad-band. Buy when bands are wide and price is low, sell
 * on the following high, regardless of width
 * @param indicators
 * @param candles
 */
function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return outOfRange(indicators, candles);
}

//todo: create a new strategy - that is ATR out of range
//Look back at all the ATR ticks. Get an average of all those ticks
//Determine if the current tick is X% above the average, if so trade