const RSI = require('technicalindicators').RSI;
import {getNumbers} from "../utils/util";
import BigNumber from "bignumber.js";

export default {
    generate,
    name: "rsi"
}

function generate(data:Array<BigNumber>):number{
    const numbers = getNumbers(data);
    const values = RSI.calculate({ values: numbers, period: 14 });
    return values[values.length -1];
}
