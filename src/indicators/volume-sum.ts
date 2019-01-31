import Candle from "../types/candle";

import {getBigNumbers, getNumbers, getProperty} from "../utils/util";
import BigNumber from "bignumber.js";
import config from "../core/config";
import candle from "../types/candle";
import {Threshold} from "../types/thresholds";

export default {
    generate,
    name: "volume-sum"
}
const long = config.namedConfigs.get("volume-sum").long;
const med = config.namedConfigs.get("volume-sum").med;
const short = config.namedConfigs.get("volume-sum").short;


//each bar in period sum volume - day volume
//each bar, take closing price diff * (volume/day volume) for the bar, sum diffs
//sum indicates if the day is pos or neg - replaces slope indicators?

function generate(data:Array<Candle>):Threshold{
   return {
       long: buildVolumeProfile(data, long).toNumber(),
       med: buildVolumeProfile(data, med).toNumber(),
       short: buildVolumeProfile(data, short).toNumber()
   }
}

function buildVolumeProfile(data:Array<Candle>, period:number){
    const periodData = data.slice(period*-1);
    const periodVolume = periodData.reduce((acc, candle):BigNumber =>{
        return acc.plus(candle.baseassetvolume);
    }, new BigNumber(0));
    const lastCandle = periodData.pop();
    if (lastCandle === undefined){
        throw new Error("why no data? shouldn't be.");
    }
    let final = new BigNumber(0);
    periodData.reduceRight((acc, candle):Candle => {
        const diff = new BigNumber(acc.close).minus(candle.close).times(candle.baseassetvolume);
        final = final.plus(diff.dividedBy(periodVolume));
        return candle;
    }, lastCandle);
    return final;
}