import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    orderPlaced,
    name: "band-slopes-trend-advisor"
}


import BigNumber from "bignumber.js";
import {getBigNumbersFromCandle} from "../utils/util";
import {QuadBand} from "../indicators/quad-band";
import candle from "../types/candle";
import Order from "../types/order";

const longLookBack = 25;
const shortLookBack = 5;
const longPrecision = 100;
const shortPrecision = 10;
const actions:Map<string, string> = new Map<string, string>();
const openOrders:Array<Order> = [];
const minWidth = 50;
const lowBand = "low";
const highBand = "high";


actions.set("up,up,low", "BUY");
actions.set("up,up,high", "HOLD");
actions.set("up,down,low", "HOLD");
actions.set("up,down,high", "SELL");
actions.set("up,flat,low", "BUY");
actions.set("up,flat,high", "SELL");
actions.set("down,up,low", "BUY");
actions.set("down,up,high", "HOLD");
actions.set("down,down,low", "HOLD");
actions.set("down,down,high", "SELL");
actions.set("down,flat,low", "BUY");
actions.set("down,flat,high", "HOLD");
actions.set("flat,up,low", "BUY");
actions.set("flat,up,high", "HOLD");
actions.set("flat,down,low", "HOLD");
actions.set("flat,down,high", "SELL");
actions.set("flat,flat,low", "BUY");
actions.set("flat,flat,high", "SELL");

function round(input:BigNumber, precision:number):number{
    return Math.round(input.toNumber() * precision)/precision;
}


function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory:Array<QuadBand> | undefined = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("band-slopes-trend-advisor strategy requires the quad-band indicator", bandHistory);
        throw new Error("band-slopes-trend-advisor strategy requires the quad-band indicator");
    }

    if (bandHistory.length < longLookBack){
        return false;
    }
    const longSlope:BigNumber = getSlopeFromBand(bandHistory, longLookBack, "bottom");
    const shortSlope:BigNumber = getSlopeFromBand(bandHistory, shortLookBack, "top");

    const longToken:string = getDirection(longSlope, longPrecision);
    const shortToken:string = getDirection(shortSlope, longPrecision);
    const lastCandle = candles[candles.length-1];
    const lastBand = bandHistory[bandHistory.length-1];
    const bandToken:string = getBandToken(lastCandle, lastBand);
    const state = [longToken, shortToken, bandToken].join(",");
    const action = actions.get(state);
    const bandWidth  = lastBand.top.minus(lastBand.bottom);
    console.log(`Should BUY? time: ${lastCandle.opentime} state: ${state} action: ${action}`);
    console.log("Band width:", bandWidth.toString());
    if (action === "BUY" && bandWidth.isGreaterThanOrEqualTo(minWidth)){
        return true;
    }
    return false;
}

function getBandToken(candle:Candle, quadBand:QuadBand):string{
    const high:string = candle.high;
    const low:string = candle.low;
    const highBandValue:BigNumber = quadBand[highBand];
    const lowBandValue:BigNumber = quadBand[lowBand];
    if (highBandValue.isLessThanOrEqualTo(high)){
        return "high"
    }
    if (new BigNumber(low).isLessThanOrEqualTo(lowBandValue)){
        return "low"
    }

    return "mid";
}




function getDirection(input:BigNumber, precision:number):string{
    if(round(input, precision) > 0){
        return "up";
    }

    if(round(input, precision) < 0) {
        return "down";
    }

    return "flat";
}

function getSlopeFromBand(quadBand:Array<QuadBand>, lookBack:number, prop:string){
    const lookBackValue:QuadBand = quadBand[quadBand.length - lookBack];
    const currentValue:QuadBand = quadBand[quadBand.length - 1];
    return getSlope(longLookBack, lookBackValue[prop], currentValue[prop]);
}

function getSlope(xDiff: number, y1:BigNumber, y2: BigNumber){
    return y2.minus(y1).dividedBy(xDiff);
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory:Array<QuadBand> | undefined = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("band-slopes-trend-advisor strategy requires the quad-band indicator", bandHistory);
        throw new Error("band-slopes-trend-advisor strategy requires the quad-band indicator");
    }

    if (bandHistory.length < longLookBack){
        return false;
    }
    const longSlope:BigNumber = getSlopeFromBand(bandHistory, longLookBack, "top");
    const shortSlope:BigNumber = getSlopeFromBand(bandHistory, shortLookBack, "top");

    const longToken:string = getDirection(longSlope, longPrecision);
    const shortToken:string = getDirection(shortSlope, shortPrecision);
    const lastCandle  = candles[candles.length-1];
    const lastBand = bandHistory[bandHistory.length-1];
    const bandToken:string = getBandToken(lastCandle, lastBand);
    const state = [longToken, shortToken, bandToken].join(",");

    const action = actions.get(state);

    console.log(`Should SELL? time: ${lastCandle.opentime} state: ${state} action: ${action}`);

    if (action === "SELL"){
        return true;
    }
    else if (action === undefined && goodSale(lastBand, lastCandle)) {
        return true;
    }

    return false;
}


function goodSale(lastBand:QuadBand, lastCandle:Candle):boolean{
    const saleValue = getSaleValue(lastCandle);
    const distanceFromLow = new BigNumber(lastCandle.high).minus(lastBand.low);
    console.log(`Possible sale value: ${saleValue} @ distance: ${distanceFromLow.toString()}`);
    if (saleValue.isGreaterThanOrEqualTo(0.5) && distanceFromLow.toNumber() > 5){
        return true;
    }
    return false;
}

function getSaleValue(lastCandle:Candle):BigNumber{

    //why it this up, up, mid??? should be down?
    if (lastCandle.opentime.getTime() === new Date("Wed Mar 07 2018 08:15:00 GMT-0500").getTime()){
        debugger;
    }

    const order:Order|undefined = openOrders[openOrders.length - 1];
    if (order === undefined){
        return new BigNumber(-100);
    }
    const price = new BigNumber(order.price);
    const possibleSale = new BigNumber(lastCandle.close);
    //is our buy price larger then sell?
    const diff = possibleSale.minus(price).dividedBy(price).times(100);
    console.log(`possible sale: ${possibleSale.toString()} - ${price.toString()} / ${price.toString()} * 100  = ${diff.toString()}` );

    return diff;
}

function orderPlaced(order:Order, indicators:Map<string, Array<any>>, candles:Array<Candle>){
    if (order.side === "BUY"){
        openOrders.push(order);
    }
    if (order.side === "SELL"){
        openOrders.pop();
    }
}