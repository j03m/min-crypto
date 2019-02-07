//Look for a breakout 20 day move - BUY
//hold until there is no new move for 10 days
//try different variations? 5 day, 30 day? hours vs days?


import Candle from "../types/candle";
import Order from "../types/order";
import BigNumber from "bignumber.js";

import config from "../core/config";
import {QuadBand} from "../indicators/quad-band";
import {Threshold} from "../types/thresholds";
let lastOrder:Order|undefined;

const highPeriod = config.namedConfigs.get("new-high").short;

export default {
    shouldBuy,
    shouldSell,
    orderPlaced,
    name: "turtle"
}


function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const highs:Array<Threshold> | undefined = indicators.get("new-high");
    const quadBand:Array<QuadBand> | undefined = indicators.get("quad-band");
    const lows:Array<Threshold> | undefined = indicators.get("new-low");
    const periodSlope:Array<Threshold>| undefined = indicators.get("period-slope");
    const volumeSums = indicators.get("volume-sum");

    if (quadBand === undefined || highs === undefined || periodSlope === undefined || volumeSums === undefined || lows === undefined){
        throw new Error("missing indicators")
    }
    const lastCandle = candles[candles.length -1];
    let buyFlag = highs[highs.length - 1].long === 1;
    const high = highs[highs.length - 1];
    const low = lows[lows.length - 1];
    const volumeSum = volumeSums[volumeSums.length - 1];
    const slopes:Threshold = periodSlope[periodSlope.length -1];
   // buyFlag = buyFlag && new BigNumber(candles[candles.length -1].high).isLessThanOrEqualTo(quadBand[quadBand.length -1].high);

    buyFlag = buyFlag && slopes.long > 0 && slopes.med > .1 && slopes.short > .1;
    console.log(`j03m BUY: ${buyFlag} @ ${lastCandle.opentime}: SL: ${slopes.long}, SM: ${slopes.med}, SS: ${slopes.short} HL: ${high.long} HM: ${high.med} HS: ${high.short} LL: ${low.long} LM: ${high.med} LS: ${high.short} VL: ${volumeSum.long} VM: ${volumeSum.med} VS: ${volumeSum.short}`);
    return buyFlag
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const highs:Array<Threshold> | undefined = indicators.get("new-high");
    const lows:Array<Threshold> | undefined = indicators.get("new-low");
    const periodSlope = indicators.get("period-slope");
    const volumeSums = indicators.get("volume-sum");
    if (highs === undefined){
        throw new Error("Requires the new-high indicator");
    }

    if (lows === undefined){
        throw new Error("Requires the new-low indicator");
    }

    if (periodSlope === undefined){
        throw new Error("requires directional")
    }

    if (volumeSums === undefined){
        throw new Error("requires volume sum")
    }

    if (lastOrder === undefined){
        return false;
    }

    const slopes = periodSlope[periodSlope.length -1];

    const lastCandle = candles[candles.length -1];
    const high = highs[highs.length -1];
    const low = lows[lows.length -1];
    const volumeSum = volumeSums[volumeSums.length - 1];
    //only sell strong trends, otherwise defer to stop loss
    let sellFlag:boolean = lookBack(periodSlope,84, "short", 0, false);
    sellFlag = sellFlag || lookBack(periodSlope,10, "med", 0, false);

    //todo: wtf is going on here, why we sell at 12:45 makes no sense
    if (!lookBack(lows, 24, "med", 0, true)){
        sellFlag = sellFlag && !lookBack(highs, 84, "long", 0, true);
    }


    console.log(`j03m SELL: ${sellFlag} @ ${lastCandle.opentime}: SL: ${slopes.long}, SM: ${slopes.med}, SS: ${slopes.short} HL: ${high.long} HM: ${high.med} HS: ${high.short} LL: ${low.long} LM: ${high.med} LS: ${high.short} VL: ${volumeSum.long} VM: ${volumeSum.med} VS: ${volumeSum.short}`);

    if (sellFlag){
        debugger;
    }

    return sellFlag;
}

function lookBack(periodSlopes:Array<Threshold>, lookBack:number, property:string, value:number, any:boolean){
    return periodSlopes.slice(lookBack * -1).reduce((acc, slopes):boolean =>{
        if (any){
            return acc || slopes[property] > value;
        }
        else {
            return acc && slopes[property] < value;
        }
    }, any ? false : true);
}

function allGreater(periodSlopes:Array<Threshold>, lookBack:number, property:string, value:number){
    return periodSlopes.slice(lookBack * -1).reduce((acc, slopes):boolean =>{
        return acc && slopes[property] > value;
    }, true);
}

function hasIndicatorForPeriod(indicators:Array<Threshold>, property:string, period:number){
    return indicators.slice(period*-1).filter((value) => {
        return value[property] === 1;
    }).length > 0;
}

function orderPlaced(order:Order, indicators:Map<string, Array<any>>, candles:Array<Candle>){
    if (order.side === "BUY"){
        console.log("j03m BOUGHT");
        lastOrder = order;
    }else {
        console.log("j03m SOLD");
        lastOrder = undefined;
    }

}
