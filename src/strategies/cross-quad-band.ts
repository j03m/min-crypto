import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    orderPlaced,
    name: "cross-quad-band"
}

import BigNumber from "bignumber.js";
import {getBigNumbersFromCandle} from "../utils/util";
import {QuadBand} from "../indicators/quad-band";
import Order from "../types/order";

enum Zones {
    peak =0,
    top =1,
    high =2,
    mid = 3,
    low = 4,
    bottom = 5
}

function getIndicator(indicators:Map<string, Array<any>>):Array<QuadBand>{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("cross-quad-band strategy requires the quad-band indicator", bandHistory);
        throw new Error("quad-band strategy requires the quad-band indicator");
    }
    return bandHistory;
}

function determineZone(candle:Candle, band:QuadBand):Zones{
    const high:BigNumber = new BigNumber(candle.high);
    if (high.isGreaterThanOrEqualTo(band.top)){
        return Zones.peak;
    }

    if (high.isLessThanOrEqualTo(band.top) && high.isGreaterThanOrEqualTo(band.high)){
        return Zones.top;
    }

    if (high.isLessThanOrEqualTo(band.high) && high.isGreaterThanOrEqualTo(band.mid)){
        return Zones.high;
    }

    if (high.isLessThanOrEqualTo(band.mid) && high.isGreaterThanOrEqualTo(band.low)){
        return Zones.mid;
    }

    if (high.isLessThanOrEqualTo(band.low) && high.isGreaterThanOrEqualTo(band.bottom)){
        return Zones.low;
    }

    if (high.isLessThanOrEqualTo(band.bottom)){
        return Zones.bottom;
    }

    throw new Error("Programmer Error!");
}

/**
 * Here, any time we move from zone to zone -1, we will trigger a buy
 * We'll record the zone the buy took place it as the pendingBuy
 *
 * When a buy comes in confirmed via orderPlaced we'll move the zone into the confirmedBuys queue wchi is
 * first in first out
 *
 * Then, when monitoring sells, we will sell in any zone that is zone + 1 of the current confirmed buy. If balanced we'll remove
 * one buy. If allInAllOut or nibbleAndFlush, we clear the queue.
 *
 * When a sell comes in confirmed from orderPlaced, we'll remove the  confirmed by from the queue. Even if it is a stop loss
 * @param indicators
 * @param candles
 */
function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    throw new Error("Im busted! I need to know if a trade was made!")
    const bandHistory = getIndicator(indicators);
    const candleNow = candles[candles.length -1];
    const candleThen = candles[candles.length -2];
    const bandNow = bandHistory[bandHistory.length -1];
    const bandThen = bandHistory[bandHistory.length -2];

    const zoneNow = determineZone(candleNow, bandNow);
    const zoneThen = determineZone(candleThen, bandThen);

    if (zoneNow < zoneThen){
        return true;
    }
    return false;
}


function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory = getIndicator(indicators);
    const candleNow = candles[candles.length -1];
    const candleThen = candles[candles.length -2];
    const bandNow = bandHistory[bandHistory.length -1];
    const bandThen = bandHistory[bandHistory.length -2];

    const zoneNow = determineZone(candleNow, bandNow);
    const zoneThen = determineZone(candleThen, bandThen);

    if (zoneNow > zoneThen){
        return true;
    }
    return false;
}

/**
 * When an
 * @param order
 */
function orderPlaced(order:Order){

}