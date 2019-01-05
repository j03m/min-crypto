import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "counting-quad-band"
}

import BigNumber from "bignumber.js";
import {getBigNumbersFromCandle} from "../utils/util";

const barsBuy = 2;
const barsSell = 1;

const Advice = require("./advice");
function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("quad-band strategy requires the quad-band indicator", bandHistory);
        throw new Error("quad-band strategy requires the quad-band indicator");
    }

    return determineSignal(getBigNumbersFromCandle(candles, "close"), bandHistory, "hasBuySignal", barsBuy);
}

function determineSignal(prices:Array<BigNumber>, bandHistory:Array<any>, method:string, bars:number): boolean{
    const start = bandHistory.length -1;
    const end = start - bars;
    if (end < 0){
        return false;
    }

    let result = true;
    for (let i = start; i > end; i--){
        const price = prices[i];
        result = result && Advice[method](price, bandHistory[i]);
    }
    return result;
}

function shouldSell(indicators:Map<string, Array<any>>, data:Array<Candle>):boolean{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("quad-band strategy requires the quad-band indicator", bandHistory);
        throw new Error("quad-band strategy requires the quad-band indicator");
    }

    return determineSignal(getBigNumbersFromCandle(data, "close"), bandHistory, "hasSellSignal", barsSell);
}