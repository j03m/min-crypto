//Look for a breakout 20 day move - BUY
//hold until there is no new move for 10 days
//try different variations? 5 day, 30 day? hours vs days?


import Candle from "../types/candle";
import Order from "../types/order";
import BigNumber from "bignumber.js";

import config from "../core/config";
import {QuadBand} from "../indicators/quad-band";
const rideTime = config.indicatorConfig.get("new-high").period;
let lastOrder:Order;
export default {
    shouldBuy,
    shouldSell,
    orderPlaced,
    name: "turtle"
}


function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const highs:Array<number> | undefined = indicators.get("new-high");
    const quadBands:Array<QuadBand>|undefined =  indicators.get("quad-band");

    if (highs === undefined){
        throw new Error("Requires the new-high indicator");
    }

    if (quadBands === undefined){
        throw new Error("Requires the quad-band indicator");
    }

    const buyFlag = highs[highs.length - 1] === 1;
    const quadBand = quadBands[quadBands.length - 1];
    const candle:Candle = candles[candles.length - 1];
    if (buyFlag){
        //debugger;
    }
    return buyFlag && quadBand.mid.isGreaterThanOrEqualTo(candle.high);
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const highs:Array<number> | undefined = indicators.get("new-high");
    const lows:Array<number> | undefined = indicators.get("new-low");
    if (highs === undefined){
        throw new Error("Requires the new-high indicator");
    }

    if (lows === undefined){
        throw new Error("Requires the new-low indicator");
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

    const close = new BigNumber(candles[candles.length -1].close);

    //run is over or we hit a new low
    return (sellFlag || lows[lows.length] === 1);
}

function orderPlaced(order:Order, indicators:Map<string, Array<any>>, candles:Array<Candle>){
    lastOrder = order;
}
