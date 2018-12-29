export enum BuySellStrategy {
    balanced = 0,
    nibbleAndFlush = 1,
    allInAllOut = 2
}


export interface Config {
    currency:string;
    asset:string;
    period:number;
    tickLen:number;
    barLen:number;
    waitToTrade: number;
    orderSize: number;
    stopPercent: number;
    tether: string; //remove me
    barProperty: string;
    tick:number;
    buySeverity:number;
    sellSeverity:number;
    buySellStategy:BuySellStrategy,
    RSILow:number,
    RSIHigh:number

};

export default Object.freeze( {
    "currency": "USD",
    "asset": "ETH",
    "period": 20,
    "tickLen": 1,
    "barLen": 15,
    //seconds in 15 min * milliseconds * num bars to wait
    "waitToTrade": 900 * 1000 * 1,
    "orderSize": 0.25,
    "stopPercent": 1,
    "tether": "USD",
    "barProperty": "close",
    "tick": 0,
    "buySeverity": "midline",
    "sellSeverity": "midline",
    "buySellStategy": BuySellStrategy.allInAllOut,
    "RSIHigh": 30,
    "RSILow": 40
});
