
feb 1-feb 10 (down market)

This config: 
const config:Config = {
    "currency": "USD",
    "asset": "ETH",
    "period": 20,
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
    "strategies":[["tracking-quad-band", "atr"]],
    "indicators":[
        "quad-band", "psar", "atr"
    ]
};

## tracking-quad-band + atr-range

current: 533.695  change: 6.739
hodl: 363.03345388788426 change: -27.393309222423145
original: 500
current bar: Sun Feb 11 2018 00:00:00 GMT-0500 total trades: 109


## quad-band (c/c) + atr-range
current: 467.842  change: -6.4316
hodl: 363.03345388788426 change: -27.393309222423145
original: 500
current bar: Sun Feb 11 2018 00:00:00 GMT-0500 total trades: 36


## quad-band (c/c) 
current: 414.421  change: -17.1158
hodl: 363.03345388788426 change: -27.393309222423145
original: 500

