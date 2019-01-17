import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "slope-trend-advisor"
}

import BigNumber from "bignumber.js";
import {getBigNumbersFromCandle} from "../utils/util";
import {QuadBand} from "../indicators/quad-band";

const lookBack = 25

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    if (candles.length < lookBack){
        return false;
    }
    
    const slope = getSlope(candles);
    if (slope.isLessThan(0) ){ //don't buy into downtrend
        return false;
    }
    else {
        return true;
    }
    
}

function getSlope(candle:Array<Candle>){
    const currentCandle = candle[candle.length-1]; //y2
    const lookBackCandle = candle[candle.length - lookBack]; //y1
    const currentHigh = new BigNumber(currentCandle.high);
    const lookBackHigh = new BigNumber(lookBackCandle.high);
    return currentHigh.minus(lookBackHigh).dividedBy(lookBack);
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    if (candles.length < lookBack){
        return false;
    }

    const slope = getSlope(candles);
    if (slope.isGreaterThan(0) ){ //don't sell into uptrend
        return false;
    }
    else {
        return true;
    }
}