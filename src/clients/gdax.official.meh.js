const GdaxClient = require("./gdax-client");
const creds = require("./gdax-creds.json");


const gdaxClient = new GdaxClient(creds);

gdaxClient.init().then(() => {
  gdaxClient.ws.candles("BTC", "USD", "15m", (data) => {
    console.log("From candles: ", data);
  });
});

