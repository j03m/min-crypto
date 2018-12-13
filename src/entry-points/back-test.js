process.on('unhandledRejection', up => { throw up });
const Client = require("../clients/db-client");
const moment = require("moment")
const testStart = moment(new Date(2017, 11, 18));
const testEnd = testStart.clone();
testEnd.add(100, "d");
const backTestParams = {
    testStart: testStart.valueOf(),
    testEnd: testEnd.valueOf()
};

const client = new Client(backTestParams);

const runner = require("../core/runner");
runner(client, backTestParams.testStart).then(() => {
    console.log("should never happen");
}).catch((e)=>{
    throw e;
});


