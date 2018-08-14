const Client = require("./db-client");
const client = new Client({
    start: new Date("September 1st 2018").getTime(),
    end: Date.now()
});

async function go(){
    await client.initDb();
    const candles =  await client.candles({
        start: new Date("September 18 2018").getTime(),
        end: new Date("September 19 2018").getTime()
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
    })
}


go().then((result) => {
    console.log("done: ", result);
});
