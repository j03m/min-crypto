import Candle from "../types/candle";
import {getBigNumbersFromCandle} from "../utils/util";
import BigNumber from "bignumber.js";

export default {
    shouldBuy,
    shouldSell,
    name: "quad-band"
}

const Advice = require("./advice");
function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined){
        throw new Error("quad-band strategy requires the quad-band indicator");
    }
    const price = new BigNumber(candles[candles.length -1]["close"]);
    return Advice.hasBuySignal(price, bandHistory[bandHistory.length-1]);
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined){
        throw new Error("quad-band strategy requires the quad-band indicator");
    }
    const price = new BigNumber(candles[candles.length -1]["close"]);
    return Advice.hasSellSignal(price, bandHistory[bandHistory.length-1]);
}