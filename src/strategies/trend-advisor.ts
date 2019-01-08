import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "trend-advisor"
}

import BigNumber from "bignumber.js";
import {QuadBand} from "../indicators/quad-band";

const lookBack = 5;

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return determineTrend(candles, true);
}

function determineTrend(candles:Array<Candle>, down:boolean):boolean{
    if (candles.length < lookBack){
        return false;
    }
    const candleHistoryLastN = candles.slice(lookBack*-1);

    //check if the last N candles have decreasing Highs or lows -
    //if they do we provide a false signal to be compared with other indicators
    //to prevent us from buying into a downtrend (we should wait for a tick up)
    //or selling into an uptrend (we should wait for a tick down)
    let lastCandle:Candle|undefined = undefined;
    return !candleHistoryLastN.reduceRight((acc, candle):boolean => {
        if(lastCandle !== undefined){ //skip first
            if (down){
                acc = acc && new BigNumber(lastCandle.low).isLessThan(candle.low);
            }else {//up
                acc = acc && new BigNumber(lastCandle.low).isGreaterThan(candle.low);
            }

        }
        lastCandle = candle;
        return acc;
    }, true);
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return determineTrend(candles, false);
}