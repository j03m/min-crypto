# min-crypto

The absolute minimum amount of code I can write to have a functional crypto trader/backtester

Will trade. Back tester in flight. This code is a work in flight, adopt with caution.


TECH TODO:
* ~~Can you download eth usd to backtest db?~~
* Prettier
* TypeScript
* TS Lint


## Indicators and strategies

### Indicators generate data and plots

Indicators go into the indicators folder. The config has an array of indicators 
that the bot should generate. All indicators receive the current set of market data history
and return a point in the indictor. They all implement a "generate" interface

The bots reads config, loads indicators and on each tick, generates them all keeping their points in a map.

This is then fed to the render which gives each indicator its own div in the report. (?) 


### Strategies make decisions on indicators

Loaded from the strategies folder, the config indicates what strategies to use. Strategies in
config is an array of arrays. Each sub array is anded, all arrays together are or-ed.

Strategies always receive all indictor history and all data history and then return a true/false for the shouldBuy/shouldSell APIS


### Stops and Limits

We're might end up paying fees on gdax if we aren't careful about how we enter orders. We should check if GDAX responses tell us.  

For stops, we have to put those in our selves SEPARATE From buy order. We also have to cancel them when we sell. 

Algo for stops:

* Enter a buy order, get an order ID, hold it in open orders
* Open order is a recording of current open quantity and prices. I can have N of these
* If current price causes any open order to have LOST N% we flush that order (this is our stop)


TODO: 

I really need a way to benchmark multiple strategies at the same time - easiest way to do that is modify backtester to accept strat/ind as params and ignore config files if so
and run multiple CLIs

WE need to implement fees and figure out the right way to use MKT vs LMT. LMTs won't fill and we'll have to have logic about entry points being fulfilled which will be harder to backtest. 

MKTS have fees but will fill faster and won't neccessarily be our computed entry points so our back tests could be more inaccurate.


- Next run the next 180 days as test. July onward 