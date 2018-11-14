process.on('unhandledRejection', up => { throw up });
const BinanceLive = require("binance-api-node").default;
const creds = require("./creds");
const client = BinanceLive({
  apiKey: creds.apiKey,
  apiSecret: creds.apiSecret,
});
const runner = require("./runner");
runner(client).then(()=>{
    console.log("should never happen");
}).catch((e)=>{
    throw e;
});

