const assert = require("assert");

//pluck a specific value and return it as an array
function extractPrice(bars, index){
    return bars.map(function(bar){
        return bar[index];
    });
}

const unitMilliseconds = Object.freeze([
    60000, //m
    60000 * 60, //h
    3600000 * 24, //d
    3600000 * 24 * 7,
    3600000 * 24 * 7 * 30, //roughly...
]);

const validIntervals = Object.freeze({
    m:0,
    h:1,
    d:2,
    w:4,
    M:5
});

//flip the above into
const intervalValues = Object.freeze(Object.keys(validIntervals));

/***
 * Separates an interval string into a numeric value and a unit string
 * @param {String} interval
 */
function expandInterval(interval){
    let value = interval.match(/\d+/);
    if (!Array.isArray(value)){
        throw new Error(`failed to extract a numeric interval, was ${interval} correct?`);
    }

    let unit = interval.match(/[mhdwM]/);
    if (!Array.isArray(unit)) {
        throw new Error(`failed to extract a string unit for the interval interval, was ${interval} correct?`);
    }

    let unitNumeral = validIntervals[unit[0]];
    value = parseInt(value[0], 10);
    assert(typeof unitNumeral === 'number', 'The unit for an interval must be m, h, d, w or M');

    let cost = unitMilliseconds[unitNumeral] * value;

    return {unit: unitNumeral, value, cost};
}


module.exports = {
    unitMilliseconds,
    expandInterval,
    intervalValues,
    validIntervals
};
