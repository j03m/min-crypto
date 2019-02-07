import Candle from "../types/candle";

import BigNumber from "bignumber.js";
import {getNumbers, getProperty, getBigNumbers} from "../utils/util"
import QuadBandGenerator, {QuadBand} from "./quad-band";
export default {
    generate,
    name: "quad-band-diff"
}


function generate(data: Array<Candle>, periodOverride:number|undefined):QuadBand  {
    const quadBand:QuadBand = QuadBandGenerator.generate(data, undefined);
    const lastCandle = data[data.length -1];
    return {
        top: quadBand.top.minus(lastCandle.close),
        high: quadBand.high.minus(lastCandle.close),
        mid: quadBand.mid.minus(lastCandle.close),
        low: quadBand.low.minus(lastCandle.close),
        bottom: quadBand.bottom.minus(lastCandle.close)
    };
}
