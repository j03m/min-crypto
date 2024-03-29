import Candle from "../types/candle";

import BigNumber from "bignumber.js";
import {getNumbers, getProperty, getBigNumbers} from "../utils/util"
import config from "../core/config";
const BandGenerator = require('technicalindicators').BollingerBands;
const period = 80;
export default {
    generate,
    name: "quad-band"
}


function generate(data: Array<Candle>, periodOverride:number|undefined): QuadBand {
    const numbers = getNumbers(getBigNumbers(getProperty(data, "close")));
    if (numbers.length < period){
        throw new Error("Cannot generate indicator, not enough data.");
    }
    const _period = periodOverride === undefined ? period : periodOverride;
    return makeGuide(
        makeBand(numbers.slice(period * -1), _period, 1),
        makeBand(numbers.slice(period * -1), _period, 2)
    );
}

export interface QuadBand {
    [index:string]:BigNumber,
    top: BigNumber,
    high: BigNumber,
    mid: BigNumber,
    low: BigNumber,
    bottom: BigNumber
}

export interface Band {
    upper: number,
    middle: number,
    lower: number
}

function makeBand(data: Array<number>, period: number, stdDev: number) {
    return BandGenerator.calculate({
        period: period,
        values: data,
        stdDev: stdDev
    })[0];
}

function makeGuide(innerBand: Band, outerBand: Band): QuadBand {
    if (!innerBand && !outerBand) {
        throw new Error("Invalid input");
    }
    return {
        top: new BigNumber(outerBand.upper),
        high: new BigNumber(innerBand.upper),
        mid: new BigNumber(innerBand.middle),
        low: new BigNumber(innerBand.lower),
        bottom: new BigNumber(outerBand.lower)
    }
};