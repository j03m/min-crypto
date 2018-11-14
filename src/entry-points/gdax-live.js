process.on('unhandledRejection', up => { throw up });
const Gdax = require("./gdax-client").default;
const creds = require("./gdax-creds");
const client = Gdax({
  apiKey: creds.apiKey,
  apiSecret: creds.apiSecret,
});
const runner = require("./runner");
runner(client).then(()=>{
  console.log("should never happen");
}).catch((e)=>{
  throw e;
});

