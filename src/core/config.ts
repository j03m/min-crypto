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
    namedConfigs: Map<string, any>;

};


//todo: use a single object for the same configs, freeze it
const namedConfigs = new Map<string, any>();
namedConfigs.set("new-high", {
    long: 96,
    med: 96/2,
    short: 96/4
});

namedConfigs.set("volume-sum", {
    long: 96,
    med: 96/2,
    short: 96/4
});

namedConfigs.set("new-low", {
    long: 96,
    med: 96/2,
    short: 96/4
});

namedConfigs.set("min-profit", {
    threshold: 5
});


namedConfigs.set("period-slope", {
    long: 96*2, //2 days
    med: 96, //1 day
    short: 96/4 //1/4 day
});


namedConfigs.set("directional", {
    required: 96*4,
    period: 96
});

const config:Config = {
    "currency": "USD",
    "asset": "ETH",
    "backFill": 96*4,
    "maxBars": 500,
    "tickLen": 1,
    "barLen": 15,
    //seconds in 15 min * milliseconds * num bars to wait
    "waitToTrade": 900 * 1000 * 1,
    "orderSize": 0.25,
    "stopPercent": 8,
    "tether": "USD",
    "barProperty": "close",
    "tick": 0,
    "buySellStategy": BuySellStrategy.allInAllOut,
    "decimalPlaces": 5,
    "brief":false,
    "strategies":[[ "turtle"]],
    "indicators":[
        "quad-band", "new-high", "psar", "new-low", "directional", "period-slope", "volume-sum"
    ],
    namedConfigs: namedConfigs
};

export default Object.freeze(config) as Config;
