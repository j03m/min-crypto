export enum BuySellStrategy {
    balanced = 0,
    nibbleAndFlush = 1,
    allInAllOut = 2
}

export interface Config {
    currency:string;
    asset:string;
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
    brief: boolean,
    backFill: number,
    maxBars: number,
    indicatorConfig: Map<string, any>;

};


const indicatorConfig = new Map<string, any>();
indicatorConfig.set("new-high", {
    period: 24
});

indicatorConfig.set("new-low", {
    period: 24
})

const config:Config = {
    "currency": "USD",
    "asset": "ETH",
    "backFill": 100,
    "maxBars": 500,
    "tickLen": 1,
    "barLen": 15,
    //seconds in 15 min * milliseconds * num bars to wait
    "waitToTrade": 900 * 1000 * 1,
    "orderSize": 0.25,
    "stopPercent": 2,
    "tether": "USD",
    "barProperty": "close",
    "tick": 0,
    "buySellStategy": BuySellStrategy.allInAllOut,
    "decimalPlaces": 5,
    "brief":false,
    "strategies":[["turtle"]],
    "indicators":[
        "quad-band", "new-high", "new-low", "psar"
    ],
    indicatorConfig: indicatorConfig
};

export default Object.freeze(config) as Config;
