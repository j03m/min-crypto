"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const debug = require("debug")("fetch");
const { expandInterval, } = require("../utils/util");
const defaultMaxBars = 500;
async function fetchCandles(options) {
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
async function doFetchInSteps(fetchAction, symbol, interval, timeWindows, handler) {
    let results = [];
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
        if (handler) {
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
function calculateCallTimeWindows(startTime, endTime, intervalObj, maxBars) {
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
//# sourceMappingURL=bars.js.map