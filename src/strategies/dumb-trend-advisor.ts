import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "dumb-trend-advisor"
}

import BigNumber from "bignumber.js";
import {QuadBand} from "../indicators/quad-band";
import candle from "../types/candle";

const lookBack = 5;
//don't buy into increasing lows
function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const currentCandle = candles[candles.length -1];
    const previousCandle = candles[candles.length -2];
    if (new BigNumber(currentCandle.low).isLessThanOrEqualTo(previousCandle.low)){
        return false;
    }
    return true;
}

//don't sell into increasing highs
function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const currentCandle = candles[candles.length -1];
    const previousCandle = candles[candles.length -2];
    if (new BigNumber(currentCandle.high).isGreaterThanOrEqualTo(previousCandle.high)){
        return false;
    }
    return true;
}