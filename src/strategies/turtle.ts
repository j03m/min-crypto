//Look for a breakout 20 day move - BUY
//hold until there is no new move for 10 days
//try different variations? 5 day, 30 day? hours vs days?


import Candle from "../types/candle";
import Order from "../types/order";
import BigNumber from "bignumber.js";

import config from "../core/config";
import {QuadBand} from "../indicators/quad-band";
import {AdxEntry} from "../types/adx";
import {getSlope} from "../utils/util";
import {Threshold} from "../types/thresholds";
let lastOrder:Order|undefined;
export default {
    shouldBuy,
    shouldSell,
    orderPlaced,
    name: "turtle"
}


function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const highs:Array<Threshold> | undefined = indicators.get("new-high");
    const quadBand:Array<QuadBand> | undefined = indicators.get("quad-band");
    const periodSlope:Array<number>| undefined = indicators.get("period-slope");
    if (quadBand === undefined || highs === undefined || periodSlope === undefined){
        throw new Error("missing indicators")
    }

    let buyFlag = highs[highs.length - 1].long === 1;
    const slope = periodSlope[periodSlope.length -1];
    if (slope <= 0){
        buyFlag = buyFlag && new BigNumber(candles[candles.length -1].low).isLessThanOrEqualTo(quadBand[quadBand.length -1].high);
    }
    return buyFlag
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const highs:Array<Threshold> | undefined = indicators.get("new-high");
    const lows:Array<Threshold> | undefined = indicators.get("new-low");
    const slopes:Array<Threshold> | undefined = indicators.get("period-slope");
    if (highs === undefined){
        throw new Error("Requires the new-high indicator");
    }

    if (lows === undefined){
        throw new Error("Requires the new-low indicator");
    }

    if (slopes === undefined){
        throw new Error("requires directional")
    }

    if (lastOrder === undefined){
        return false;
    }

    const newHigh = highs[highs.length-1].med === 1;
    const newLow = lows[lows.length-1].med  === 1;
    const slope = slopes[slopes.length -1].short;

    let sellFlag:boolean = (newHigh || newLow) && (slope < 0);

    console.log(`should selll? : ${sellFlag} Slope: ${slope.toString()}, Has High: ${newHigh} Has low: ${newLow}`);

    if (sellFlag){
        debugger;
    }

    return sellFlag;
}

function orderPlaced(order:Order, indicators:Map<string, Array<any>>, candles:Array<Candle>){
    if (order.side === "BUY"){
        lastOrder = order;
    }else {
        lastOrder = undefined;
    }

}
