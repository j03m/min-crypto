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
    buySellStategy:BuySellStrategy,
    decimalPlaces: number
    strategies:Array<Array<string>>
    indicators:Array<string>

};

const config:Config = {
    "currency": "USD",
    "asset": "ETH",
    "period": 80,
    "tickLen": 1,
    "barLen": 15,
    //seconds in 15 min * milliseconds * num bars to wait
    "waitToTrade": 900 * 1000 * 1,
    "orderSize": 0.05,
    "stopPercent": 100,
    "tether": "USD",
    "barProperty": "close",
    "tick": 0,
    "buySellStategy": BuySellStrategy.nibbleAndFlush,
    "decimalPlaces": 5,
    "strategies":[["tracking-quad-band", "band-slopes-trend-advisor", "min-profit"]],
    "indicators":[
        "quad-band", "psar"
    ]
};

export default Object.freeze(config) as Config;
