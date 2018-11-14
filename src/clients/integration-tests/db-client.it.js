const Client = require("./db-client");
const client = new Client();

async function go(){
    await client.initDb();
    const candles =  await client.candles({
        startTime: new Date("September 18 2018").getTime(),
        endTime: new Date("September 19 2018").getTime()
    });
    console.log("candles:", candles);

    //order
    //register execution handlers
    client.ws.user((msg) => {
        console.log("user: ", msg);
    });

    await client.order( {
        symbol: "ETHBTC",
        side: 'BUY',
        quantity: "0.25",
        price: "0.004901900",
    });

    client.ws.candles("ETHBTC", "15m", (candle) => {
        console.log("bar:", candle);
    });
}


go().then((result) => {
    console.log("done: ", result);
});
