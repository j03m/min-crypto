const Client = require("../gdax-client");
const creds = require("../../gdax-creds.json");
const client = new Client(creds);

async function go(){
  // client.ws.candles("ETH", "USD", "15m", (candle) => {
  //   console.log("bar:", candle);
  // });

  // const result = await client.candles({
  //   symbol: "ETH-USD",
  //   interval: "15m",
  //   endTime: Date.now(),
  //   startTime: Date.now() - (60000 * 15 * 20)
  // });
  //
  // console.log(result);
}


go().then((result) => {
  console.log("done: ", result);
});
