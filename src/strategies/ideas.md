/**
 My idea here is to take the low and high bars back X period and build a channel line

 Cases:

 Uptrend channel - both slopes are positive.
 Downtrend channel - both slopes are negative
 Widening triangle - top positive, bottom negative
 tightening triangle - top negative, bottom positive


 Also interesting is the slope indicator indicating velocity of movement. If we see slope spikes we can wait
 until it regresses (flattens) back to a range then sell. So the strategy would be see spike, indicate ready to
 act state (buy/sell) wait for regression, act. This sort of absolves us from trying to do that ourselves with
 channels


 If we go channels:

 uptrend channel we should initiate at the bottom of the bands (consider longer period bands, those looked tight)

 downtrend channel - judge based on angel of decent, do not initiate, wait for a flattening or ascend



 Consider confirmations?

 Consider a long term and short term slope, comparing the difference, what says bullish vs what says bearish?


 //lets start simple, long uptrend or long down trend?
 
 
 
 ### From scratch
 look back 1 - 25 bars
 look back 2 - 5 bars

Slope-Long - up, Slope-Short - up, Band-Low
    Buy

Slope-Long - up Slope-Short - up Band-High
    If Bought, HOLD, else BUY

Slope-Long - up Slope - Short - down Band-Low
    HOLD

Slope-Long - up Slope - Short - down Band-High
    Sell?? (maybe or hold?)

Slope-Long - up Slope - Short - flat Band-Low
    BUY


Slope-Long - up Slope - Short - flat Band-High
    SELL
    

Slope - Long - down Slope-Short - up Band-Low
    BUY

Slope - Long - down Slope-Short - up Band-High
    SELL
    
Slope - Long - down Slope - Short - down Band-Low
    HOLD 
    
Slope - Long - down Slope - Short - down Band-High
    SELL
    
Slope - Long - down Slope - Short - flat Band-Low
    BUY
    
Slope - Long - down Slope - Short - flat Band-High
    HOLD

Slope - Long - flat Slope-Short - up Band-Low
    BUY
    
Slope - Long - flat Slope-Short - up Band-High
    HOLD

Slope - Long - flat Slope - Short - down Band-Low
    HOLD
    
Slope - Long - flat Slope - Short - down Band-High
    SELL
    
Slope - Long - flat Slope - Short - flat Band-Low
    BUY
    
Slope - Long - flat Slope - Short - flat Band-High
    SELL
    
    
### Refinement

The idea of looking at specific slopes, could we observe the deceleration of price over time to determine a reversal by looking at slopes? Ie, look at the value of N slopes over the last X bars - are we accellerating or decelerating?

Noise reduction algos? Can they help here? Could we smooth prices? Isn't that just what a mva is tho?   

Another idea is the concept of a beacon price. Could we behave like market maker and based on larger trend data set prices on the short term? Ie, get the price for a 25 day mva for daily bars, and use that as the place we buy and sell around?