import Candle from "../types/candle";

const assert = require("assert");
import BigNumber from "bignumber.js";
import * as Enums from "../types/enums";

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