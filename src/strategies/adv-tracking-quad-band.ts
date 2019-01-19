import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    orderPlaced,
    name: "adv-tracking-quad-band"
}

import BigNumber from "bignumber.js";
import {getBigNumbersFromCandle} from "../utils/util";
import {QuadBand} from "../indicators/quad-band";
import Order from "../types/order";
import order from "../types/order";

interface ZonedOrder {
    order: Order,
    zone: Zone
}

const lookBack = 5;
const threshhold = 80;
const openOrders:Array<ZonedOrder> = [];

enum Zone {
    bottom = 0,
    low = 1,
    belowMid = 2,
    aboveMid = 3,
    high = 4,
    top = 5,
    unknown = 6
}

const minDistance = 2;


function determineZones(indicators: Map<string, Array<any>>, candles: Array<Candle>) {
    const bandHistory = getBandHistory(indicators);
    const lastCandle = candles[candles.length - 1];
    const lastBand = bandHistory[bandHistory.length - 1];

    //get the last conservative buy candles, SAVE For the LAST
    const previousNCandles = candles.slice(lookBack * -1, -1);
    const previousNBands = bandHistory.slice(lookBack * -1, -1);


    //you need to change determine zone a bit, for above midline, we should maybe be looking at highs?
    //for below midline we should be looking at lows

    const trendZone: Zone = determineZone(
        getBigNumbersFromCandle(previousNCandles, "high"),
        previousNBands);

    const newZone = determineZone(
        [new BigNumber(lastCandle.high)],
        [lastBand]);
    return {trendZone, newZone};
}

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):undefined{
    // const {trendZone, newZone} = determineZones(indicators, candles);
    //
    //
    // //if any zone is unkown, false
    // if (trendZone === Zone.unknown || newZone === Zone.unknown){
    //     return false
    // }
    //
    // //if the newZone is less then the old zone (by N?) - true, else false
    // if (trendZone - newZone >= minDistance || newZone <= Zone.low){
    //     return true;
    // }
    //
    // return false;
    return undefined;
}

function determineZone(prices:Array<BigNumber>, bandHistory:Array<any>): Zone{

    let top = 0;
    let high = 0;
    let mid = 0;
    let midH = 0;
    let low = 0;
    let bottom = 0;
    for (let i = 0; i < bandHistory.length; i++){
        const price = prices[i];
        const band:QuadBand = bandHistory[i];
        if (price.isLessThan(band.bottom)){
            bottom++
        }
        else if (price.isLessThan(band.low)){
            low++;
        }
        else if (price.isLessThan(band.mid)){
            mid++;
        }

        if (price.isGreaterThanOrEqualTo(band.top)){
            top++;
        }
        else if (price.isGreaterThanOrEqualTo(band.high)){
            high++;
        }
        else if (price.isGreaterThanOrEqualTo(band.mid)){
            midH++;
        }

    }

    top = top / bandHistory.length * 100;
    high = high / bandHistory.length * 100;
    mid = mid / bandHistory.length * 100;
    midH = midH / bandHistory.length * 100;
    low = low / bandHistory.length * 100;
    bottom = bottom / bandHistory.length * 100;

    const portions = {
        top,
        high,
        mid,
        midH,
        low,
        bottom
    };

    const winner = determineMajorityOverThreshold(portions);

    if (winner == "top"){
        return Zone.top;
    }

    if (winner == "high"){
        return Zone.high;
    }

    if (winner == "midH"){
        return Zone.aboveMid;
    }

    if (winner == "mid"){
        return Zone.belowMid;
    }

    if (winner == "low"){
        return Zone.low;
    }

    if (winner == "bottom"){
        return Zone.bottom
    }

    return Zone.unknown;

}

interface Score{
    [key:string]: number
}

function determineMajorityOverThreshold(portions:Score):string{
    let max = 0;
    const participants = Object.keys(portions);
    return participants.reduce((winner:any, name:string):string|null => {
        const value:number = portions[name];
        if (value > threshhold && value > max){
            max = value;
            winner = name;
        }
        return winner;
    }, null);
}


function getBandHistory(indicators:Map<string, Array<any>>):Array<QuadBand>{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("tracking-quad-band strategy requires the quad-band indicator", bandHistory);
        throw new Error("quad-band strategy requires the quad-band indicator");
    }
    return bandHistory;
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{

    const latestBuyOrder:ZonedOrder = openOrders[0];
    if (latestBuyOrder === undefined){
        return false;
    }

    const {trendZone, newZone} = determineZones(indicators, candles);
    //if any zone is unknown, false
    if (newZone === Zone.unknown){
        return false
    }

    const orderZone = latestBuyOrder.zone;

    //if the newZone is less then the old zone (by N?) - true, else false
    if (newZone - orderZone >= minDistance){
        return true;
    }

    return false;
}

function orderPlaced(order:Order, indicators:Map<string, Array<any>>, candles:Array<Candle>){
    if (order.side === "BUY"){
        const {trendZone, newZone} = determineZones(indicators, candles);

        openOrders.push({
            order: order,
            zone : newZone
        });
    }
    if (order.side === "SELL"){
        openOrders.shift();
    }
}