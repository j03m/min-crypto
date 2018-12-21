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
    if (request.url.indexOf("plotly") !== -1){
      response.end(fs.readFileSync(`${process.cwd()}/dist/vis/plotly-min.js`).toString());
      return;
    }

    const history = bot.history;
    const valueHistory = bot.valueHistory;
    const template = fs.readFileSync(`${process.cwd()}/dist/vis/template.html`).toString();
    const final = processTemplate(template, history, valueHistory);
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

//todo: get template assets to copy via tsc
//todo: run and observe back test

function processTemplate(template, history, valueHistory) {

  const dates = extractDateArray(history.candles);

  template = template.replace(/\"\%DATES\%\"/g, dates);
  template = template.replace(/\"\%OPEN\%\"/g, extractOpen(history.candles));
  template = template.replace(/\"\%HIGH\%\"/g, extractHigh(history.candles));
  template = template.replace(/\"\%LOW\%\"/g, extractLow(history.candles));

  const close = extractClose(history.candles);

  template = template.replace(/\"\%CLOSE\%\"/g, close);
  template = template.replace(/\"\%START\%\"/g, extractStart(history.candles));
  template = template.replace(/\"\%END\%\"/g, extractEnd(history.candles));

  template = template.replace(/\"\%TOP\%\"/g, extractBand(history.bands, "top"));
  template = template.replace(/\"\%HIGHBAND\%\"/g, extractBand(history.bands, "high"));
  template = template.replace(/\"\%MID\%\"/g, extractBand(history.bands, "mid"));
  template = template.replace(/\"\%LOWBAND\%\"/g, extractBand(history.bands, "low"));
  template = template.replace(/\"\%BOTTOM\%\"/g, extractBand(history.bands, "bottom"));

  const buys = extractTrades(history.candles, history.trades, "BUY", dates);
  template = template.replace(/\"\%BUYS\%\"/g, buys);
  template = template.replace(/\"\%SELLS\%\"/g, extractTrades(history.candles, history.trades, "SELL", dates));

  template = template.replace(/\"\%BUYDATES\%\"/g, dates);
  template = template.replace(/\"\%SELLDATES\%\"/g, dates);

  const {min, max} = extractMinMax(history.candles);
  template = template.replace(/\"\%MIN\%\"/g, min);
  template = template.replace(/\"\%MAX\%\"/g, max);

  const valueDates = extractProperty(valueHistory, "when");
  const hodlValue = extractProperty(valueHistory, "holdValue");
  const tradeValue = extractProperty(valueHistory, "tradedValue");
  const originalValue = extractProperty(valueHistory, "originalValue");

  const {minValue, maxValue} = extractMinMaxValue(history.candles);
  template = template.replace(/\"\%MINVALUE\%\"/g, minValue);
  template = template.replace(/\"\%MAXVALUE\%\"/g, maxValue);


  template = template.replace(/\"\%VALUEDATES\%\"/g, valueDates);
  template = template.replace(/\"\%HODL\%\"/g, hodlValue);
  template = template.replace(/\"\%TRDED\%\"/g, tradeValue);
  template = template.replace(/\"\%ORIG\%\"/g, originalValue);

  return template;
}


function extractProperty(data, key){
  return JSON.stringify(data.map((entry) => { return entry[key]; }));
}



function extractTrades(candles, trades, key, dates){
  return JSON.stringify(candles.reduce((acc, candle, index)=>{
    const trade = trades[candle.opentime.getTime()];
    if (trade && trade.side === key){
        acc.push(BN(trade.price).toNumber());
    }else {
      acc.push(undefined);
    }
    return acc;
  }, []));
}

function extractBand(bands, key){
  return JSON.stringify(bands.map((band) => {
    return band[key].toNumber();
  }));
}


function extractMinMaxValue(valueHistory){
  return valueHistory.reduce((acc, values) => {
    if (acc.min === undefined){
      acc.min = values.originalValue;
    }

    if (acc.max === undefined){
      acc.max = values.originalValue;
    }

    if (values.originalValue > acc.max){
      acc.max = values.originalValue;
    }

    if (values.tradedValue > acc.max){
      acc.max = values.tradedValue;
    }

    if (values.holdValue > acc.max){
      acc.max = values.holdValue;
    }

    if (values.originalValue < acc.min){
      acc.min = values.originalValue;
    }

    if (values.tradedValue < acc.min){
      acc.min = values.tradedValue;
    }

    if (values.holdValue < acc.min){
      acc.min = values.holdValue;
    }

    return acc;

  }, { min: undefined, max: undefined});
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