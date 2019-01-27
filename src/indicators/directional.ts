import Candle from "../types/candle";
import BigNumber from "bignumber.js";
import {getBigNumbers, getNumbers, getProperty} from "../utils/util";
import config from "../core/config";
const ADX = require('technicalindicators').ADX;
export default {
    generate,
    name: "directional"
}

const period = config.namedConfigs.get("directional").period;
const required = config.namedConfigs.get("directional").required;

function generate(data:Array<Candle>):number{
    if (data.length < required){
        throw new Error("not enough bars");
    }
    const lastFifty = data.length >= required ? data.slice(required * -1) : data;
    const high = getNumbers(getBigNumbers(getProperty(lastFifty, "high")));
    const low = getNumbers(getBigNumbers(getProperty(lastFifty, "low")));
    const close = getNumbers(getBigNumbers(getProperty(lastFifty, "close")));


    let input = { high, low, close, period };
    const values = new ADX.calculate(input);
    return values[values.length -1];
}
