import Candle from "../types/candle";

export default {
    shouldBuy,
    shouldSell,
    name: "psar"
}

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const psarData = indicators.get("psar");
    if (psarData === undefined){
        throw new Error("psar strategy requires the psar indicator");
    }
    const low = candles[candles.length -1].low;
    const psar = psarData[psarData.length - 1];
    if (psar < low){
        return true;
    }
    return false;
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const psarData = indicators.get("psar");
    if (psarData === undefined){
        throw new Error("psar strategy requires the psar indicator");
    }
    const high = candles[candles.length -1].high;
    const psar = psarData[psarData.length - 1];
    if (psar > high){
        return true;
    }
    return false;
}