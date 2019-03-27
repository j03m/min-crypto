# Next set tatical

Read the math guides, but don't drown. Just get them down quick.

Write a basic neural network in js from scratch for "feel". use the flappy bird
if you can find it.


# Long Term Trends

* Download price data for muliple instruments for 2017 - 1yr of data. Use stocks if you have to.

* Get at least 5 instruments

* For each instrument generate: 
    
    * QuadBand distances 90 days (not bar), 60 day, 30 day, 15 day, 5 day, 90 bars, etc
    * Slopes, same period
    * Volume Summary, same period
    * new highs, new lows same periods
    * Figure out how to measure volume + price change as accelleration in N periods

* Using a day chart, classify each day based on the 30 macro pattern as:

    > Top Reversal 2
    > Ascending 1
    > Trending 0
    > Descending -1
    > Bottom Reversal -2
    
* Mark each BAR cell in the spread sheet for the day (maybe wire this into the logger so you don't have to do it manually)

* Train the models 

* For a separate instrument, look at 2018 data and test the model against assumptions

* Once the model is trained, back test different strategies? (buy button reversals, sell top reversals), (buy ascending, sell descending)


Interesting data points (calculus):

>From what we've seen so far, it seems that there is a relationship between a function reaching an extreme value (a maximum or a minimum), and a derivative value of 0. This makes intuitive sense; the derivative represents the slope of the line, so when a function changes from a negative slope to a positive slope, or vice-versa, the derivative must pass through 0.

>What we can learn from this is that interesting things seem to happen to the function when the derivative is 0. We call points where the derivative crosses 0 critical points, because they indicate that the function is changing direction. When a function changes direction from positive to negative, it forms a peak (or a local maximum), when the function changes direction from negative to positive it forms a trough (or local minimum), and when it maintains the same overall direction but changes the concavity of the slope it creates an inflexion point.


Skewness (direction of skew) and Kurtosis (how peaked?) measures could be interest?

Range also interesting Max-min 

Consider data points 1,2 and 3 std from the mean and the how their percent likelihood can play into short term trades? Z-score

We an use best fit lines to get a feel for direction? Perhaps channels?

Can we correlate our any data point to indicating a reversal? 

Or, can we correlate any data point to indicating a continuation? (maybe easier)