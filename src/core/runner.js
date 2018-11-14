

async function go(client, start){
    try{

        if (typeof client.init === "function"){
            await client.init();
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
