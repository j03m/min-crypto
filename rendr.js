const readline = require("readline");
const moment = require("moment");
const BN = require("bignumber.js");

function getReady() {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}

function set(txt) {
  process.stdout.write(txt);
  process.stdout.write("\n");
}

function web(bot) {
  //wire a really basic http listener on localhost
  //on request:
  //bot.history
  //read template
  //do a replace with data points
  //serve

  const http = require("http");
  const fs = require("fs");
  const port = 3000;

  const requestHandler = (request, response) => {
    const history = bot.history;
    const template = fs.readFileSync("./template.html").toString();
    const final = processTemplate(template, history);
    response.end(final);
  };

  const server = http.createServer(requestHandler)

  server.listen(port, (err) => {
    if (err) {
      return console.log("something bad happened", err)
    }

    console.log(`server is listening on ${port}`)
  });

}

function processTemplate(template, history) {
  //todo collapse all these loops into one destructure call
  template = template.replace(/\%DATES\%/g, extractDateArray(history.candles));
  template = template.replace(/\%OPEN\%/g, extractOpen(history.candles));
  template = template.replace(/\%HIGH\%/g, extractHigh(history.candles));
  template = template.replace(/\%LOW\%/g, extractLow(history.candles));
  template = template.replace(/\%CLOSE\%/g, extractClose(history.candles));
  template = template.replace(/\%START\%/g, extractStart(history.candles));
  template = template.replace(/\%END\%/g, extractEnd(history.candles));

  const {min, max} = extractMinMax(history.candles);
  template = template.replace(/\%MIN\%/g, min);
  template = template.replace(/\%MAX\%/g, max);
  return template;
}

function extractMinMax(candles){
  return candles.reduce((acc, candle) => {
    if (acc.min === undefined){
      acc.min = candle.low;
    }

    if (acc.max === undefined){
      acc.max = candle.high;
    }

    if (candle.high > acc.max){
      acc.max = candle.high;
    }

    if (candle.low < acc.min){
      acc.min = candle.low;
    }

    return acc;

  }, { min: undefined, max: undefined});
}

function extractStart(candles){
  return candles[0].opentime;
}

function extractEnd(candles){
  return candles[candles.length -1].opentime;
}

function extractNumber(candles, key){
  return JSON.stringify(candles.map((candle) => {
    return BN(candle[key]).toNumber();
  }));
}

function extractOpen(candles){
  return extractNumber(candles, "open");
}

function extractHigh(candles){
  return extractNumber(candles, "high");
}

function extractClose(candles){
  return extractNumber(candles, "close");
}

function extractLow(candles){
  return extractNumber(candles, "low");
}

function extractDateArray(candles) {
  return JSON.stringify(candles.map((candle) => {
    return candle.opentime.getTime()
  }));
}


module.exports = {
  getReady,
  set,
  web
}