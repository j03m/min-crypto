

async function go(client, start){
    try{
        // const initActions = [
        //     state.fetchBars(),
        //     //state.fetchPortfolio()
        // ];

        //await Promise.all(initActions);
        //j03m turn this into an init function
        if (typeof client.initDb === "function"){
            await client.initDb();
        }
        const bot = require("./bot")(client);
        await bot.fetchBars(start);
        await bot.fetchPortfolio();
        await bot.cancelOpenOrders();
        bot.initComplete = true;

        await bot.listen();
    }catch(e){
        throw e;
    }

}

module.exports = go;
