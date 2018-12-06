import Candle from "./candle";
import  * as Enums  from "../types/enums"

/**
 * Receives a candle request, returns a
 * promise for an array of candles
 */
export interface FetchHandler {
    (request:CandlesRequest):Promise<Array<Candle>>
}

/**
 * Receives an array of candles, does something
 * with but is not expected to return anything
 * but a promise indicating operation completion
 */
export interface ResultHandler {
    (data:Array<Candle>):Promise<undefined>
}

/**
 * A set of options required to handle
 * multiple serial requests to an exchange
 * for data
 */
export interface FetchOptions {
    fetchAction:FetchHandler,
    symbol:string,
    interval: Enums.Interval,
    endTime:number,
    startTime:number,
    handler: ResultHandler,
    maxBars: number,
}

/**
 * Data required to pull candle
 * stick data from a given exchange
 */
export interface CandlesRequest {
    symbol: string,
    interval: Enums.Interval,
    startTime: number,
    endTime: number,
    maxBars: number
}
