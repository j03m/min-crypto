import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "tracking-quad-band"
}

import BigNumber from "bignumber.js";
import {getBigNumbersFromCandle} from "../utils/util";
import {QuadBand} from "../indicators/quad-band";


//todo: change the criteria for a conservative buy vs aggressive buy
//we should be above the midline longer for aggressive buys
const conservativeBuys = 5;
const aggressiveBuys = 10;

let lastBuyStage:Stage|undefined;

enum Stage {
    belowMidLine = 0,
    aboveMidLine = 1,
    unknown = 2,
    belowBottomLine = 3,
    aboveTopLine = 4
}

//don't use this - use trend-avisor with this instead (does a better job - we like low buys)
function isConservativeBuySafe(lastCandle:Candle, lastBand:QuadBand):boolean {
    return true;
    // const closeBn = new BigNumber(lastCandle.close);
    // //if the close is less then mid buy above the bottom
    // return closeBn.isLessThanOrEqualTo(lastBand.low) &&
    //     closeBn.isGreaterThanOrEqualTo(lastBand.bottom);

}

//still need this, trend advisor won't protect us from a "too hot" buy
function isAggressiveBuySafe(lastCandle:Candle, lastBand:QuadBand):boolean {
    const closeBn = new BigNumber(lastCandle.close);
    //if the close is less then mid buy above the bottom
    return closeBn.isLessThanOrEqualTo(lastBand.high) &&
        closeBn.isGreaterThanOrEqualTo(lastBand.mid);

}

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("tracking-quad-band strategy requires the quad-band indicator", bandHistory);
        throw new Error("quad-band strategy requires the quad-band indicator");
    }

    const stage:Stage = determineStage(
        getBigNumbersFromCandle(candles, "close"),
        bandHistory,
        "hasBuySignal",
        conservativeBuys,
        aggressiveBuys);

    const lastCandle = candles[candles.length -2];
    const lastBand = bandHistory[bandHistory.length - 2];

    //if we're above the midline, buy at the midline
    if (stage === Stage.aboveMidLine && isAggressiveBuySafe(lastCandle, lastBand)){
        lastBuyStage = stage;
        return true;
    }

    //if we're below the midline, buy at the bottom line
    if (stage === Stage.belowMidLine || stage === Stage.belowBottomLine){
        lastBuyStage = stage;
        return true;
    }

    return false;
}

function determineStage(prices:Array<BigNumber>, bandHistory:Array<any>, method:string, bars:number, agg:number): Stage{
    const start = bandHistory.length -1;
    let end = start - bars;
    if (end < 0){
        return Stage.unknown;
    }

    let belowLine = true;
    let aboveLine = true;
    let belowBottomLine = true;
    //if the last 5 bars are below mi
    for (let i = start; i > end; i--){
        const price = prices[i];
        const band:QuadBand = bandHistory[i];
        belowLine = belowLine && (price.isLessThanOrEqualTo(band.mid));
        belowBottomLine = belowBottomLine && price.isLessThanOrEqualTo(band.bottom);
    }

    //agg bars are longer time
    end = start - agg;
    for (let i = start; i > end; i--){
        const price = prices[i];
        const band:QuadBand = bandHistory[i];
        aboveLine = aboveLine && (price.isGreaterThanOrEqualTo(band.mid));
    }


    if (belowBottomLine){
        return Stage.belowBottomLine;
    }

    if (belowLine){
        return Stage.belowMidLine;
    }

    if (aboveLine){
        return Stage.aboveMidLine;
    }

    return Stage.unknown;

}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("tracking-quad-band strategy requires the quad-band indicator", bandHistory);
        throw new Error("quad-band strategy requires the quad-band indicator");
    }


    const lastCandle = candles[candles.length -2];
    const lastBand = bandHistory[bandHistory.length - 2];

    //if we bought above the midline, we sell at the top
    //really we need to inform this stragegy that there was a REAL buy event and/or a real stop loss otherwise its being dumb
    if (lastBuyStage === Stage.aboveMidLine && new BigNumber(lastCandle.close).isGreaterThanOrEqualTo(lastBand.high)){
        return true;
    }

    //if we bought below the midline, sell at the mid line
    if (lastBuyStage === Stage.belowMidLine && new BigNumber(lastCandle.close).isGreaterThanOrEqualTo(lastBand.low)){
        return true;
    }

    return false;
}