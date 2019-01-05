import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "slopes"
}

enum Trend {
    flat = 0,
    up = 1,
    down = 2,
    unknown = 3
}

import BigNumber from "bignumber.js";
import {getBigNumbersFromCandle} from "../utils/util";
import {QuadBand} from "../indicators/quad-band";
import candle from "../types/candle";

const lookBack = 25;
const flatState = .1;
const buyMaxDecent = .2;
let trend:Trend = Trend.unknown;

//combined with quad-band this loses moeny in a down market.
//It shouldn't buy if down trending, should wait till flat

function trendToString(input:Trend){
    if (input === Trend.unknown){
        return "unknown";
    }

    if (input === Trend.up){
        return "up";
    }

    if (input === Trend.down){
        return "down";
    }

    if (input === Trend.flat){
        return "flat";
    }
}

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory:Array<QuadBand> | undefined = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("slope strategy requires the quad-band indicator", bandHistory);
        throw new Error("slope strategy requires the quad-band indicator");
    }

    //todo: Wed Jan 03 2018 04:15:00 GMT-0500 (Eastern Standard Time) lastTrend: up newTrend: flat
    //This should be a sell?

    if (bandHistory.length < lookBack){
        return false;
    }
    const currentCandle = candles[candles.length - 1];
    const slope:number = getSlope(bandHistory, currentCandle);

    //SLOPES must be used with quad-band - otherwise its way to aggressive on buy
    if(slope > buyMaxDecent){
        return true;
    }

    return false;
}

function getTrend(slope: number):Trend{
    let newTrend = Trend.unknown;
    if (slope < flatState && slope > flatState*-1){
        newTrend = Trend.flat;
    }

    if (slope > flatState){
        newTrend = Trend.up;
    }

    if (slope < flatState * -1){
        newTrend = Trend.down;
    }

    if (newTrend === Trend.unknown) {
         throw new Error("Programmer Error");
    }
    return newTrend;
}

function getSlope(quadBand:Array<QuadBand>, candle:Candle){
    const lookBackValue = quadBand[quadBand.length - lookBack];
    const high = new BigNumber(candle.high).toNumber();
    const slope = (lookBackValue.mid - high) / ((quadBand.length - lookBack) - quadBand.length);
    return slope;
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory:Array<QuadBand> | undefined = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("slope strategy requires the quad-band indicator", bandHistory);
        throw new Error("slope strategy requires the quad-band indicator");
    }



    //todo: Wed Jan 03 2018 04:15:00 GMT-0500 (Eastern Standard Time) lastTrend: up newTrend: flat
    //This should be a sell?

    if (bandHistory.length < lookBack){
        return false;
    }
    const currentCandle = candles[candles.length - 1];
    const slope:number = getSlope(bandHistory, currentCandle);
    const nextTrend = getTrend(slope);
    let returnMe = false;
    if (nextTrend === Trend.flat && trend === Trend.up){
        returnMe = true;
    }
    console.log(`Should Sell: ${currentCandle.opentime} lastTrend: ${trendToString(trend)} newTrend: ${trendToString(nextTrend)}`);

    trend = nextTrend;
    return returnMe;
}


