import Candle from "../types/candle";
import {getNumbers, getNumbersFromCandle} from "../utils/util";

export default {
    shouldBuy,
    shouldSell,
    name: "trend-change-psar"
}

let lastDirection:Direction|undefined;
enum Direction {
    up = 0,
    down = 1
}
function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const psarData = indicators.get("psar");
    if (psarData === undefined){
        throw new Error("trend-change-psar strategy requires the psar indicator");
    }
    const direction:Direction = getTrendDirection(psarData, candles);
    //trend flip
    if (lastDirection === Direction.down && direction === Direction.up){
        return true;
    }
    return false;
}

function getTrendDirection(data:Array<number>, candles:Array<Candle>):Direction{
    const candle = candles[candles.length-1];
    const psar = data[data.length -1];
    const [high] = getNumbersFromCandle([candle], "high");
    const [low] = getNumbersFromCandle([candle], "low");
    if (psar >= high){
        return Direction.down;
    }
    if (psar <= low){
        return Direction.up;
    }
    console.log(`this shouldn't ever be possible afaik high: ${high}, low: ${low} psar: ${psar}`);
    throw new Error("this shouldn't ever be possible afaik");
}

/**
 * NOTE: We only record the last direction ON sell. because sell is always called after buy
 * @param indicators
 * @param candles
 */
function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const psarData = indicators.get("psar");
    if (psarData === undefined){
        throw new Error("trend-change-psar strategy requires the psar indicator");
    }
    const direction:Direction = getTrendDirection(psarData, candles);
        //trend flip
    if (lastDirection === Direction.up && direction === Direction.down){
        lastDirection = direction;
        return true;
    }
    lastDirection = direction;
    return false;
}