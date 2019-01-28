import Candle from "../types/candle";
import config from "../core/config";
import {getSlope, round} from "../utils/util";


export default {
    generate,
    name: "period-slope"
}

const long = config.namedConfigs.get("period-slope").long;
const med = config.namedConfigs.get("period-slope").med;
const short = config.namedConfigs.get("period-slope").short;
import BigNumber from "bignumber.js";
import {Threshold} from "../types/thresholds";

function generate(data:Array<Candle>):Threshold{
    if (data.length < long){
        throw new Error(`Indicator period-slope is set to a period of ${long} but received only ${data.length} bars`);
    }

    return {
        long: getSlopeFromDataForPeriod(data, long),
        med: getSlopeFromDataForPeriod(data, med),
        short: getSlopeFromDataForPeriod(data, short),
    };
}

function getSlopeFromDataForPeriod(data:Array<Candle>, period:number){
    const periodStart = data[data.length - period];
    const periodEnd = data[data.length -1];
    return round(getSlope(long, new BigNumber(periodStart.high), new BigNumber(periodEnd.high)), 10);
}
