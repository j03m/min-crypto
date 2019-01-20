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
    indicators:Array<string>,
    brief: boolean

};

const config:Config = {
    "currency": "USD",
    "asset": "ETH",
    "period": 80,
    "tickLen": 1,
    "barLen": 15,
    //seconds in 15 min * milliseconds * num bars to wait
    "waitToTrade": 900 * 1000 * 1,
    "orderSize": 0.25,
    "stopPercent": 5,
    "tether": "USD",
    "barProperty": "close",
    "tick": 0,
    "buySellStategy": BuySellStrategy.nibbleAndFlush,
    "decimalPlaces": 5,
    "brief":false,
    "strategies":[["band-slopes-trend-advisor"]],
    "indicators":[
        "quad-band", "fast-quad-band", "psar"
    ]
};

export default Object.freeze(config) as Config;
