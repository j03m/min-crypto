import Candle from "../types/candle";
import BigNumber from "bignumber.js";
import * as Enums from "../types/enums";

const assert = require("assert");

export const unitMilliseconds = Object.freeze([
    60000, //m
    60000 * 60, //h
    3600000 * 24, //d
    3600000 * 24 * 7,
    3600000 * 24 * 7 * 30, //roughly...
]);

type IntervalValues = {
    [name: string]: number;
}

export const validIntervals:IntervalValues = Object.freeze({
    m:0,
    h:1,
    d:2,
    w:4,
    M:5
});



export type ExpandedInterval = {
    unit: number,
    intervalUnit: string,
    cost: number

}

/***
 * Separates an interval string into a numeric value and a unit string
 * @param {String} interval
 */
export function expandInterval(interval:Enums.Interval):ExpandedInterval{
    let value = interval.match(/\d+/);
    if (!Array.isArray(value)){
        throw new Error(`failed to extract a numeric interval, was ${interval} correct?`);
    }

    let unit = interval.match(/[mhdwM]/);
    if (!Array.isArray(unit)) {
        throw new Error(`failed to extract a string unit for the interval interval, was ${interval} correct?`);
    }

    const intervalUnit:string = strToIntervalValue(unit[0]);
    let unitNumeral:number = validIntervals[intervalUnit];
    const numericValue:number = parseInt(value[0], 10);
    assert(typeof unitNumeral === 'number', 'The unit for an interval must be m, h, d, w or M');

    let cost = unitMilliseconds[unitNumeral] * numericValue;

    return {unit: unitNumeral, intervalUnit, cost};
}

function strToIntervalValue(input:string):string{
    if(Object.keys(validIntervals).includes(input)){
        return input;
    }else throw new Error("Invalid interval:" + input);
}


export function getNumbers(data:Array<BigNumber>){
    const numbers = data.map((value) => {
        return value.toNumber()
    });
    return numbers;
}

export function getBigNumbers(data:Array<string>){
    return data.map((entry:number|string) => {
        return new BigNumber(entry);
    });
}

export function getBigNumbersFromCandle(data:Array<Candle>, prop:string){
    return getBigNumbers(getProperty(data,prop));
}

export function getNumbersFromCandle(data:Array<Candle>, prop:string){
    return getNumbers(getBigNumbers(getProperty(data, prop)));
}

export function getProperty(data:Array<Candle>, prop:string){
    const props:Array<string> = data.map((candle:Candle) => {
        return candle[prop];
    }) as Array<string>;
    return props;
}

export function getLastHigh(data:Array<Candle>):BigNumber{
    return new BigNumber(data[data.length -1].high);
}

export function getLastLow(data:Array<Candle>):BigNumber{
    return new BigNumber(data[data.length -1].low);
}

export function getLastCandleTime(data:Array<Candle>):Date{
    return data[data.length - 1].opentime;
}

export function isNewHigh(data:Array<Candle>, lookBack:number):boolean{
    const lastHigh = getLastHigh(data);
    const comparison = data.slice(lookBack * -1, data.length -1);

    let result = true;
    for(let i = 0; i< comparison.length; i++){
        result = result && lastHigh.isGreaterThan(comparison[i].high);
        if (result === false){
            break;
        }
    }
    return result;
}

export function isNewLow(data:Array<Candle>, lookBack:number):boolean{
    const lastLow = getLastLow(data);
    const comparison = data.slice(lookBack * -1, data.length -1);

    let result = true;
    for(let i = 0; i< comparison.length; i++){
        result = result && lastLow.isLessThan(comparison[i].low);
        if (result === false){
            break;
        }
    }
    return result;
}

export function getSlope(xDiff: number, y1: BigNumber, y2: BigNumber) {
    return y2.minus(y1).dividedBy(xDiff);
}

export function round(input: BigNumber, precision: number): number {
    return Math.round(input.toNumber() * precision) / precision;
}