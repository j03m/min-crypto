const maf = require("mathjs");
const assert = require("assert");

/**
 * jokes:
 *
 * A lot of people asked me "Why JavaScript" and so I put this slide together to answer that: "How dare you?"
 *
 */

/**
 Gradient Descent for Linear Regression


 ## Wat?

 Regression == predicting a real value ouput
 Linear == spoiler alert - we use a line :)

 Our job in supervised machine learning using linear regression is to spit out a linear equation that hopefully
 makes informed and therefor accurate predictions against NEW data.

 ## Hypothesis

 Since we know we're going to use a line, we know our prediction of y is a function of x.

 h(x) = predicted y

 where h is our hypothesis or output function.

 We're going to use a model with two theta values. Theta 1 and theta 2. (question for ML: I believe this is largely arbitrary, I could use 1 or 3 or 10)

 h(x) = thetaZero + thetaOne * x

 Note: We can use more complicated non-linear functions well (that will come later)


 ## Cost Function

 So if we just draw a line wherever, how do we know if its good or not? As human we can visually see, but what is it the best?

 The cost function lets us measure if our line is any good


 Theta is our model.
 Alpha is our learning rate

 Our purpose is to find the theta which has the minimum "cost" for data set.

 Cost is a squared error cost function.

 M will be the number of samples in our training set. So the algo will look like:

 For each M

 Find the partial derivative of our cost function as it applies to theta, times the learning rate
 and subtract it from the current theta. Then do it again and again for each new value of theta.

 Additional slide: #1 what is a derivative, #2 what is a partial derivative

 Doing this will reduce the cost function giving us a line that is the the "best fit" for our data
 and can let us make predictions.

 **/

var fs = require('fs');
var wstream = fs.createWriteStream('thetas.dat');



//cost function should be - (what we predicted) minus (what should be squared)
function hypothesisFn(theta0, theta1, x){
    return theta0 + theta1 * x;
}

// the cost function we'll never use because we use the simplified form
function cost(hypothesisValue, correctValue){
    return Math.pow(hypothesisValue - correctValue, 2);
}


function errorTheta0(hypothesis, y){
    return hypothesis - y;
}


function errorTheta1(hypothesis, y, x){
    return (hypothesis - y) * x;
}



//average cost
function averageCost(theta0, theta1, costFn, samples){
    return samples.reduce((sumCost, sample) => {
        sumCost += costFn(hypothesisFn(theta0, theta1, sample.x), sample.y, sample.x);
        return sumCost;
    }, 0);
}


function calculateNewThetas(theta0, theta1, alpha, samples){
    const newTheta0 = theta0 - alpha  * averageCost(theta0, theta1, errorTheta0, samples) ;
    const newTheta1 = theta1 - alpha * averageCost(theta0, theta1,  errorTheta1, samples);
    if (isNaN(newTheta0) || isNaN(newTheta1)){
        debugger;
    }
    return {
        theta0: newTheta0,
        theta1: newTheta1
    };
}

function train(samples, alpha){
    let thetas = {
        theta0: 0,
        theta1: 0
    };


    for (let i = 0; i < 50000; i++){
        thetas = calculateNewThetas(thetas.theta0, thetas.theta1, alpha, samples);
    }

    return thetas;
}

/** how to visualize? Best way in javascript? **/

/** how to visualize gradient descent in js? **/

const trainingData = [
    {
        x: 133 - 135,
        y: 0
    },
    {
        x: 160 - 135,
        y: 1
    },
    {
        x: 152 - 135,
        y: 1
    },
    {
        x: 120 - 135,
        y: 0
    },

];

trainingData.forEach((data)=>{
    wstream.write(`${data.x},${data.y}\n`)
});


const test = [
    {
        x: 100 - 135,
        y: 1
    }
];

console.log("Untrained: ", hypothesisFn(Math.random(), Math.random(), test[0].x));

const thetas = train(trainingData, 0.001);

console.log("Trained: ", hypothesisFn(thetas.theta0, thetas.theta1, test[0].x));
