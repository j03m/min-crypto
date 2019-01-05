import Candle from "../types/candle";

const ATR = require('technicalindicators').ATR;

import {getNumbers, getProperty, getBigNumbers} from "../utils/util";
import BigNumber from "bignumber.js";

export default {
    generate,
    name: "atr"
}

const period = 14;

function generate(data:Array<Candle>):number{
    const high = getNumbers(getBigNumbers(getProperty(data, "high")));
    const low = getNumbers(getBigNumbers(getProperty(data, "low")));
    const close = getNumbers(getBigNumbers(getProperty(data, "close")));

    let input = { high, low, close, period };
    const values = new ATR.calculate(input);
    return values[values.length -1];
}
