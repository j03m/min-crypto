/***
 * streams indicators as csv to an output file for machine learning training
 */

import Candle from "../types/candle";
import {Threshold} from "../types/thresholds";
import {QuadBand} from "../indicators/quad-band";
const fs = require("fs");
const stream = fs.createWriteStream("./data.csv");
header();

export default {
    shouldBuy,
    shouldSell,
    name: "indicator-data-log"
}

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    // console.log(`j03m BUY: ${buyFlag} @ ${lastCandle.opentime}: SL: ${slopes.long}, SM: ${slopes.med}, SS: ${slopes.short} HL: ${high.long} HM: ${high.med} HS: ${high.short} LL: ${low.long} LM: ${high.med} LS: ${high.short} VL: ${volumeSum.long} VM: ${volumeSum.med} VS: ${volumeSum.short}`);

    const highs:Array<Threshold> | undefined = indicators.get("new-high");
    const lows:Array<Threshold> | undefined = indicators.get("new-low");
    const periodSlope = indicators.get("period-slope");
    const volumeSums = indicators.get("volume-sum");
    const quadBand = indicators.get("quad-band-diff");
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
    if (quadBand === undefined){
        throw new Error("requires quad-band-diff");
    }


    const lastCandle = candles[candles.length -1];
    const lastQuadBand:QuadBand = quadBand[quadBand.length -1];
    const slopes = periodSlope[periodSlope.length -1];
    const volumeSum = volumeSums[volumeSums.length -1];
    const high = highs[highs.length - 1];
    const low = lows[lows.length -1];



    stream.write([lastCandle.opentime,
        lastQuadBand.top, lastQuadBand.high, lastQuadBand.mid, lastQuadBand.low, lastQuadBand.bottom,
        high.long, high.med, high.short,
        low.long, low.med, low.short,
        slopes.long, slopes.med, slopes.short,
        volumeSum.long, volumeSum.med, volumeSum.short,
        "none" //entry/exit will be added manually
    ].join(",") + "\n");

    return false;
}

function header(){
    //write the column names
    stream.write(["date",
        "quad-band-top-diff", "quad-band-high-diff", "quad-band-mid-diff", "quad-band-low-diff", "quad-band-bottom-diff",
        "is-new-high-long", "is-new-high-med", "is-new-high-short",
        "is-new-low-long", "is-new-low-med", "is-new-low-short",
        "slope-long", "slope-med", "slope-short",
        "volume-sum-long", "volume-sum-med", "volume-sum-short",
        "action"].join(",") + "\n");
}


function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return false;
}

