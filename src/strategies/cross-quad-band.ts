import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "cross-quad-band"
}

import BigNumber from "bignumber.js";
import {getBigNumbersFromCandle} from "../utils/util";
import {QuadBand} from "../indicators/quad-band";


function getIndicator(indicators:Map<string, Array<any>>):Array<QuadBand>{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("cross-quad-band strategy requires the quad-band indicator", bandHistory);
        throw new Error("quad-band strategy requires the quad-band indicator");
    }
    return bandHistory;
}

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const bandHistory = getIndicator(indicators);


}


function shouldSell(indicators:Map<string, Array<any>>, data:Array<Candle>):boolean{
    const bandHistory = getIndicator(indicators);


}