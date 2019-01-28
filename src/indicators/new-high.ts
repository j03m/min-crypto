import Candle from "../types/candle";

import {isNewHigh} from "../utils/util";

export default {
    generate,
    name: "new-high"
}

import config from "../core/config";
import {Threshold} from "../types/thresholds";
const longPeriod = config.namedConfigs.get("new-high").long;
const medPeriod = config.namedConfigs.get("new-high").medium;
const shortPeriod = config.namedConfigs.get("new-high").short;

function generate(data:Array<Candle>):Threshold{
    if (data.length < longPeriod){
        throw new Error(`Indicator new-high is set to a period of ${longPeriod} but received only ${data.length} bars`);
    }
    const long = isNewHigh(data, longPeriod);
    const med = isNewHigh(data, medPeriod);
    const short = isNewHigh(data, shortPeriod);
    return {
        long: long ? 1 : 0,
        med: med ? 1 : 0,
        short: short ? 1 : 0,
    };
}
