import Candle from "../types/candle";

const PSAR = require('technicalindicators').PSAR;

//todo: here change all indicators to accept candles, implement psar
//use psar to help determine entry and exit points
import {getNumbers, getProperty, getBigNumbers} from "../utils/util";
import BigNumber from "bignumber.js";

export default {
    generate,
    name: "psar"
}

const period = 50;
const step = 0.02;
const max = 0.2;

function generate(data:Array<Candle>):number{
    const lastFifty = data.length >= period ? data.slice(period * -1) : data;
    const high = getNumbers(getBigNumbers(getProperty(lastFifty, "high")));
    const low = getNumbers(getBigNumbers(getProperty(lastFifty, "low")));
    let input = { high, low, step, max };
    const values = new PSAR.calculate(input);
    return values[values.length -1];
}
