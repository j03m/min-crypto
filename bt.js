process.on('unhandledRejection', up => { throw up });
const Client = require("./db-client");
const moment = require("moment")
const testStart = moment(new Date(2018, 6, 11));
const testEnd = testStart.clone();
testEnd.add(30, "d");
const backTestParams = {
    testStart: testStart.valueOf(),
    testEnd: testEnd.valueOf()
};

const client = new Client(backTestParams);

const runner = require("./runner");
runner(client, backTestParams.testStart).then(() => {
    console.log("should never happen");
}).catch((e)=>{
    throw e;
});


