import Candle from "./candle";
import  * as Enums  from "../types/enums"
export interface FetchHandler {
    (request:CandlesRequest):Promise<Array<Candle>>
}


export interface FetchOptions {
    fetchAction:FetchHandler,
    symbol:string,
    interval: Enums.Interval,
    endTime:Date,
    startTime:Date,
    handler: Array<Candle>,
    maxBars: number
}

export interface CandlesRequest {
    symbol: string,
    interval: Enums.Interval,
    startTime: number,
    endTime: number,
    maxBars: number
}
