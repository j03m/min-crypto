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

  const dates = extractDateArray(history.candles);

  template = template.replace(/\%DATES\%/g, dates);
  template = template.replace(/\%OPEN\%/g, extractOpen(history.candles));
  template = template.replace(/\%HIGH\%/g, extractHigh(history.candles));
  template = template.replace(/\%LOW\%/g, extractLow(history.candles));

  const close = extractClose(history.candles);

  template = template.replace(/\%CLOSE\%/g, close);
  template = template.replace(/\%START\%/g, extractStart(history.candles));
  template = template.replace(/\%END\%/g, extractEnd(history.candles));

  template = template.replace(/\%TOP\%/g, extractBand(history.bands, "top"));
  template = template.replace(/\%HIGHBAND\%/g, extractBand(history.bands, "high"));
  template = template.replace(/\%MID\%/g, extractBand(history.bands, "mid"));
  template = template.replace(/\%LOWBAND\%/g, extractBand(history.bands, "low"));
  template = template.replace(/\%BOTTOM\%/g, extractBand(history.bands, "bottom"));

  const buys = extractTrades(history.candles, history.trades, "BUY", dates);


  template = template.replace(/\%BUYS\%/g, buys);
  template = template.replace(/\%SELLS\%/g, extractTrades(history.candles, history.trades, "SELL", dates));

  template = template.replace(/\%BUYDATES\%/g, dates);
  template = template.replace(/\%SELLDATES\%/g, dates);

  const {min, max} = extractMinMax(history.candles);
  template = template.replace(/\%MIN\%/g, min);
  template = template.replace(/\%MAX\%/g, max);
  return template;
}


//todo: TRADES ARE OFF BY around 5 candles
//todo: DATES has 148 on parse, BUYS has 143 - WHY BRO?
function extractTrades(candles, trades, key, dates){
  return JSON.stringify(candles.reduce((acc, candle, index)=>{
    const trade = trades[candle.opentime.getTime()];
    if (trade){
      if (trade.side === key){
        console.log(dates[index]);
        acc.push(BN(trade.price).toNumber());
      }
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