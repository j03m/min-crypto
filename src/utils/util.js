"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
exports.unitMilliseconds = Object.freeze([
    60000,
    60000 * 60,
    3600000 * 24,
    3600000 * 24 * 7,
    3600000 * 24 * 7 * 30,
]);
exports.validIntervals = Object.freeze({
    m: 0,
    h: 1,
    d: 2,
    w: 4,
    M: 5
});
/***
 * Separates an interval string into a numeric value and a unit string
 * @param {String} interval
 */
function expandInterval(interval) {
    let value = interval.match(/\d+/);
    if (!Array.isArray(value)) {
        throw new Error(`failed to extract a numeric interval, was ${interval} correct?`);
    }
    let unit = interval.match(/[mhdwM]/);
    if (!Array.isArray(unit)) {
        throw new Error(`failed to extract a string unit for the interval interval, was ${interval} correct?`);
    }
    const intervalUnit = strToIntervalValue(unit[0]);
    let unitNumeral = exports.validIntervals[intervalUnit];
    const numericValue = parseInt(value[0], 10);
    assert(typeof unitNumeral === 'number', 'The unit for an interval must be m, h, d, w or M');
    let cost = exports.unitMilliseconds[unitNumeral] * numericValue;
    return { unit: unitNumeral, intervalUnit, cost };
}
exports.expandInterval = expandInterval;
function strToIntervalValue(input) {
    if (Object.keys(exports.validIntervals).includes(input)) {
        return input;
    }
    else
        throw new Error("Invalid interval:" + input);
}
//# sourceMappingURL=util.js.map