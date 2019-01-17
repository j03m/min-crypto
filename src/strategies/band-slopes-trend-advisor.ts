import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "band-slopes-trend-advisor"
}


import BigNumber from "bignumber.js";
import {getBigNumbersFromCandle} from "../utils/util";
import {QuadBand} from "../indicators/quad-band";
import candle from "../types/candle";

const longLookBack = 25;
const shortLookBack = 5;

const actions:Map<string, string> = new Map<string, string>();

const lowBand = "bottom";
const highBand = "top";


actions.set("up,up,low", "BUY");
actions.set("up,up,high", "HOLD");
actions.set("up,down,low", "HOLD");
actions.set("up,down,high", "SELL");
actions.set("up,flat,low", "BUY");
actions.set("up,flat,high", "SELL");
actions.set("down,up,low", "BUY");
actions.set("down,up,high", "SELL");
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

function roundToTens(input:BigNumber):number{
    return Math.round(input.toNumber() * 10)/10;
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
    const longSlope:BigNumber = getSlopeFromBandBuy(bandHistory, longLookBack);
    const shortSlope:BigNumber = getSlopeFromBandBuy(bandHistory, shortLookBack);

    const longToken:string = getDirection(longSlope);
    const shortToken:string = getDirection(shortSlope);
    const bandToken:string = getBandToken(candles[candles.length-1], bandHistory[bandHistory.length-1]);
    const action = actions.get([longToken, shortToken, bandToken].join(","));
    if (action === "BUY"){
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




function getDirection(input:BigNumber):string{
    if(roundToTens(input) > 0){
        return "up";
    }

    if(roundToTens(input) < 0) {
        return "down";
    }

    return "flat";
}

function getSlopeFromBandBuy(quadBand:Array<QuadBand>, lookBack:number){
    const lookBackValue:QuadBand = quadBand[quadBand.length - lookBack];
    const currentValue:QuadBand = quadBand[quadBand.length - 1];
    return getSlope(longLookBack, lookBackValue.bottom, currentValue.bottom);
}


function getSlopeFromBandSell(quadBand:Array<QuadBand>, lookBack:number){
    const lookBackValue:QuadBand = quadBand[quadBand.length - lookBack];
    const currentValue:QuadBand = quadBand[quadBand.length - 1];
    return getSlope(longLookBack, lookBackValue.top, currentValue.top);
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
    const longSlope:BigNumber = getSlopeFromBandSell(bandHistory, longLookBack);
    const shortSlope:BigNumber = getSlopeFromBandSell(bandHistory, shortLookBack);

    const longToken:string = getDirection(longSlope);
    const shortToken:string = getDirection(shortSlope);
    const bandToken:string = getBandToken(candles[candles.length-1], bandHistory[bandHistory.length-1]);
    const action = actions.get([longToken, shortToken, bandToken].join(","));
    if (action === "SELL"){
        return true;
    }
    return false;
}


