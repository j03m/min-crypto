const bars = require("../core/bars");
const {Client} = require("pg");

//seconds in a day, 30 days, 12 months (1 year) to millseconds
const CACHE_SIZE = 86400 * 30 * 12 *  1000;
const CURRENCY = "USD";
const ASSET = "ETH";
const BAR_LEN = 15;
const yargs = require("yargs").argv;

const currency = yargs.currency === undefined ? CURRENCY : yargs.currency;
const asset = yargs.asset === undefined ? ASSET : yargs.asset;
let symbol;

process.on('unhandledRejection', up => { throw up });

//accept readline for db pass
async function go(exchangeClient, maxBars, requestDelay){
    symbol = exchangeClient.getSymbol(asset, currency);
    const dbClient = new Client({
        host: 'localhost',
        database: 'bot',
        user: 'postgres'
    });
    await dbClient.connect();
    await doFetch(dbClient, exchangeClient, maxBars, requestDelay);
    await dbClient.end();

}

//Fetch N bars and stick it in a db for back testing

//stick them in the db tables


function setTimeoutP(time){
  return new Promise((f) => {
    setTimeout(f, time);
  });
}

/***
 * {
  openTime: 1508328900000,
  open: '0.05655000',
  high: '0.05656500',
  low: '0.05613200',
  close: '0.05632400',
  volume: '68.88800000',
  closeTime: 1508329199999,
  quoteAssetVolume: '2.29500857',
  trades: 85,
  baseAssetVolume: '40.61900000'
}
 */
async function doFetch(dbClient, exchangeClient, maxBars, requestDelay){
    //back fill things
    const startTime = Date.now() - CACHE_SIZE;
    const endTime = Date.now();
    const response = await bars.fetchCandles({
        fetchAction: async (request) => {
            await setTimeoutP(requestDelay); //delay
            return await exchangeClient.candles(request);
        },
        handler: async (data) => {
            //insert each row into the db
            console.log("writing...", data[0]);
            const insert = `INSERT INTO bars
                                    (   symbol,
                                        openTime,
                                        open,
                                        high,
                                        low,
                                        close,
                                        quoteAssetVolume,
                                        baseAssetVolume)
                                     VALUES 
                                     (  $1, 
                                        to_timestamp($2),
                                        $3,
                                        $4,
                                        $5,
                                        $6,
                                        $7,
                                        $8)`;

                //todo: getting NaN error for timestamp prob in the candle converter
                for (let i = 0; i < data.length; i++){
                    const insertValues = convertObject(data[i]);
                    try{
                      await dbClient.query({
                        text: insert,
                        values: insertValues
                      });
                    }catch(ex){
                      console.log("Failed to execute sql query: ", insert, " ", "data: ", data);
                      throw ex;
                    }

                }

            return []; //so we don't build a buffer
        },
        symbol: symbol,
        interval: BAR_LEN + "m",
        startTime: startTime,
        endTime: endTime,
        maxBars: maxBars
    });
    return response;
}

function convertObject(bar){
    return [
        symbol,
        bar.opentime.getTime() / 1000, //postgres timestamp is seconds
        bar.open,
        bar.high,
        bar.low,
        bar.close,
        bar.volume,
        bar.volume
    ];

}

module.exports = go;