const BN = require("bignumber.js");
import {BigNumber} from "bignumber.js"
import {getNumbers} from "../utils/util"
const BandGenerator = require('technicalindicators').BollingerBands;

export default {
    generate,
    name: "quad-band"
}


function generate(data: Array<BigNumber>): QuadBand {
    const numbers = getNumbers(data);
    return makeGuide(
        makeBand(numbers, 20, 1),
        makeBand(numbers, 20, 2)
    );
}

export interface QuadBand {
    top: number,
    high: number,
    mid: number,
    low: number,
    bottom: number
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
        top: BN(outerBand.upper),
        high: BN(innerBand.upper),
        mid: BN(innerBand.middle),
        low: BN(innerBand.lower),
        bottom: BN(outerBand.lower)
    }
};