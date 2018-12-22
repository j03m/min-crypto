# min-crypto

The absolute minimum amount of code I can write to have a functional crypto trader/backtester

Will trade. Back tester in flight. This code is a work in flight, adopt with caution.


TECH TODO:
* ~~Can you download eth usd to backtest db?~~
* Prettier
* TypeScript
* TS Lint


FEATURE TODO:

* We're not making money - investigste better entry/exit selection
* stop loss on portfolio value
    > if current holdings have lost more then N% of their value, then we dump
* calculate and include fees live and in backtest
* live gdax smoke run (are we functional - no)


## Indicators and strategies

### Indicators generate data and plots

Indicators go into the indicators folder. The config has an array of indicators 
that the bot should generate. All indicators receive the current set of market data history
and return a point in the indictor. They all implement a "generate" interface

The bots reads config, loads indicators and on each tick, generates them all keeping their 
points in a map.

This is then fed to the render which gives each indicator its own div in the report. (?) 


### Strategies make decisions on indicators

Loaded from the strategies folder, the config indicates what strategies to use. Strategies in
config is an array of arrays. Each sub array is anded, all arrays together are or-ed.

Strategies always receive all indictor history and all data history and then return a true/false for the shouldBuy/shouldSell APIS






