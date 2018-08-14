const Client = require("./db-client");
const client = new Client({
    start: new Date("September 1st 2018").getTime(),
    end: Date.now()
});

const runner = require("./runner");
runner(client).then(() => {
    console.log("should never happen");
}).catch((e)=>{
    throw e;
});


