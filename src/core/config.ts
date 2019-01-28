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


const namedConfigs = new Map<string, any>();
namedConfigs.set("new-high", {
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
    long: 96/2,
    med: 96/4,
    short: 96/8
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
    "stopPercent": 10,
    "tether": "USD",
    "barProperty": "close",
    "tick": 0,
    "buySellStategy": BuySellStrategy.allInAllOut,
    "decimalPlaces": 5,
    "brief":false,
    "strategies":[[ "turtle"]],
    "indicators":[
        "quad-band", "new-high", "psar", "new-low", "directional", "period-slope"
    ],
    namedConfigs: namedConfigs
};

export default Object.freeze(config) as Config;
