const Client = require("./db-client");

const testStart = new Date("July 1 2018");
const testEnd = testStart.addDays(30);
const backTestParams = {
    testStart: testStart,
    testEnd: testEnd
}

const client = new Client(backTestParams);

const runner = require("./runner");
runner(client, backTestParams.testStart).then(() => {
    console.log("should never happen");
}).catch((e)=>{
    throw e;
});


