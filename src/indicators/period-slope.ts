import Candle from "../types/candle";
import config from "../core/config";
import {getSlope, round} from "../utils/util";


export default {
    generate,
    name: "period-slope"
}

const period = config.namedConfigs.get("period-slope").period;
import BigNumber from "bignumber.js";

function generate(data:Array<Candle>):number{
    if (data.length < period){
        throw new Error(`Indicator period-slope is set to a period of ${period} but received only ${data.length} bars`);
    }
    const periodStart = data[data.length - period];
    const periodEnd = data[data.length -1];
    return round(getSlope(period, new BigNumber(periodStart.low), new BigNumber(periodEnd.high)), 10);

}
