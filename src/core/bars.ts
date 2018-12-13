import * as CandleRequest from "../types/candles-request";
import {CandlesRequest} from "../types/candles-request";
import Candle from "../types/candle";
import {FetchHandler} from "../types/candles-request";
import {Interval} from "../types/enums";

const assert = require("assert");
const debug = require("debug")("fetch");
const {
    expandInterval,
} = require("../utils/util");
const defaultMaxBars = 500;

interface TimeWindow {
    start: number,
    end: number
}

async function fetchCandles(options: CandleRequest.FetchOptions) {
    let fetchAction = options.fetchAction;
    let symbol = options.symbol;
    let interval = options.interval;
    let startTime = options.startTime;
    let endTime = options.endTime;
    let maxBars = options.maxBars;
    let handler = options.handler;

    assert(typeof startTime === "number" && startTime < Date.now(), "startTime must be a number less then the current time");
    assert(typeof endTime === "number", "endTime must be a number");
    assert(startTime < endTime, "startTime must be before endTime");

    //understand the interval
    let intervalObj = expandInterval(interval);

    let timeWindows = calculateCallTimeWindows(startTime, endTime, intervalObj, maxBars);

    return doFetchInSteps(fetchAction, symbol, interval, timeWindows, handler);
}

async function doFetchInSteps(fetchAction: CandleRequest.FetchHandler,
                              symbol: string,
                              interval: Interval,
                              timeWindows: Array<TimeWindow>,
                              handler: CandleRequest.ResultHandler) {
    let results: Array<Candle> = [];
    for (let startEndPair of timeWindows) {
        debug("fetching...");
        let result = await fetchAction({
            symbol: symbol,
            interval: interval,
            startTime: startEndPair.start,
            endTime: startEndPair.end,
            maxBars: 300
        });
        debug("fetched, handling...");
        if (handler){
            await handler(result);
        }
        debug("handled.");
        results = results.concat(result);
    }
    return Promise.resolve(results);
}

/**
 * Calculates the specifc time windows for multiple data fetches required to fetch an entire range
 * @param startTime
 * @param endTime
 * @param intervalObj
 * @param maxBars
 */
function calculateCallTimeWindows(startTime: number,
                                  endTime: number,
                                  intervalObj: any,
                                  maxBars: number): Array<TimeWindow> {
    //next we want to determine how many calls we need to make to fetch all intervals between start and end time.
    let windowStart = startTime;
    let windowEnd = 0;
    let finalMaxBars = maxBars || defaultMaxBars;
    let results = [];
    while (windowStart < endTime) {
        windowEnd = windowStart + intervalObj.cost * finalMaxBars;
        results.push({
            start: windowStart,
            end: windowEnd
        });
        windowStart = windowEnd;
    }
    return results;
}


module.exports = {
    fetchCandles
};