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
    const periodSlope:Array<Threshold>| undefined = indicators.get("period-slope");
    if (quadBand === undefined || highs === undefined || periodSlope === undefined){
        throw new Error("missing indicators")
    }
    const lastCandle = candles[candles.length -1];
    let buyFlag = highs[highs.length - 1].long === 1;
    const slopes:Threshold = periodSlope[periodSlope.length -1];
   // buyFlag = buyFlag && new BigNumber(candles[candles.length -1].high).isLessThanOrEqualTo(quadBand[quadBand.length -1].high);

    buyFlag = buyFlag && slopes.long > 0 && slopes.med >= 0 && slopes.short >=0;
    console.log(`j03m BUY: ${buyFlag} @ ${lastCandle.opentime}: ${slopes.long} - ${slopes.med} - ${slopes.short}`);
    return buyFlag
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const highs:Array<Threshold> | undefined = indicators.get("new-high");
    const lows:Array<Threshold> | undefined = indicators.get("new-low");
    const periodSlope = indicators.get("period-slope");
    if (highs === undefined){
        throw new Error("Requires the new-high indicator");
    }

    if (lows === undefined){
        throw new Error("Requires the new-low indicator");
    }

    if (periodSlope === undefined){
        throw new Error("requires directional")
    }

    if (lastOrder === undefined){
        return false;
    }

    const slopes = periodSlope[periodSlope.length -1];
    const lastCandle = candles[candles.length -1];
    //only sell strong trends, otherwise defer to stop loss
    let sellFlag:boolean = slopes.long > .5 && slopes.short < 0 && slopes.long + slopes.short <= 0;

    console.log(`j03m SELL: ${sellFlag} @ ${lastCandle.opentime}: ${slopes.long} - ${slopes.med} - ${slopes.short}`);


    return sellFlag;
}

function hasIndicatorForPeriod(indicators:Array<Threshold>, property:string, period:number){
    return indicators.slice(period*-1).filter((value) => {
        return value[property] === 1;
    }).length > 0;
}

function orderPlaced(order:Order, indicators:Map<string, Array<any>>, candles:Array<Candle>){
    if (order.side === "BUY"){
        lastOrder = order;
    }else {
        lastOrder = undefined;
    }

}
