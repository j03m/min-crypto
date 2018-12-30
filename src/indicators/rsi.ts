import Candle from "../types/candle";

const RSI = require('technicalindicators').RSI;
import {getBigNumbers, getNumbers, getProperty} from "../utils/util";
import BigNumber from "bignumber.js";

export default {
    generate,
    name: "rsi"
}
const period = 14;
function generate(data:Array<Candle>):number{
    const numbers = getNumbers(getBigNumbers(getProperty(data, "close")));
    const values = RSI.calculate({ values: numbers.slice(period * -1), period: period });
    return values[values.length -1];
}
