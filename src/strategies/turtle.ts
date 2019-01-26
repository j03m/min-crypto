//Look for a breakout 20 day move - BUY
//hold until there is no new move for 10 days
//try different variations? 5 day, 30 day? hours vs days?


import Candle from "../types/candle";
import Order from "../types/order";
import BigNumber from "bignumber.js";

import config from "../core/config";
import {QuadBand} from "../indicators/quad-band";
import {getLastHigh} from "../utils/util";
import candle from "../types/candle";
const rideTime = config.namedConfigs.get("new-high").period / 2;
let lastOrder:Order;
export default {
    shouldBuy,
    shouldSell,
    orderPlaced,
    name: "turtle"
}


function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const highs:Array<number> | undefined = indicators.get("new-high");
    const quadBand:Array<QuadBand> | undefined = indicators.get("quad-band");
    const periodSlope:Array<number>| undefined = indicators.get("period-slope");
    if (quadBand === undefined || highs === undefined || periodSlope === undefined){
        throw new Error("missing indicators")
    }

    let buyFlag = highs[highs.length - 1] === 1;
    const slope = periodSlope[periodSlope.length -1];
    if (slope <= 0){
        buyFlag = buyFlag && new BigNumber(candles[candles.length -1].low).isLessThanOrEqualTo(quadBand[quadBand.length -1].high);
    }

    if(buyFlag){
        debugger
    }

    return buyFlag
}


//todo: add +/- DMI as a confirming indicator
//what happened march 14-19
function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const highs:Array<number> | undefined = indicators.get("new-high");
    const directional:Array<number> | undefined = indicators.get("directional");
    if (highs === undefined){
        throw new Error("Requires the new-high indicator");
    }

    if (directional === undefined){
        throw new Error("requires directional")
    }


    if (lastOrder === undefined){
        return false;
    }


    //if there has been any new high in ride time? If so don't sell
    let sellFlag = true;
    for(let i = highs.length - rideTime; i<=highs.length; i++){
        const indicator:number = highs[i];
        if (indicator === 1){
            sellFlag = false;
            break;
        }
    }

    //run is over
    if(sellFlag){
        sellFlag = directional[directional.length -1] !== 1;
    }
    return sellFlag;
}

function orderPlaced(order:Order, indicators:Map<string, Array<any>>, candles:Array<Candle>){
    lastOrder = order;
}
