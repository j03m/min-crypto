process.on('unhandledRejection', up => { throw up });
import DBClient from "../clients/db-client";
const moment = require("moment")
const testStart = moment(new Date(2018, 0, 1));
const testEnd = testStart.clone();
testEnd.add(30, "d");

//test: jan 7-9 lose money, miss upswing
//test jan 17-19 lose money
//test jan 22-25 lost money
//test march 11-12 lost money
//test march 16-17 lost money
//test march 23-24 lost money
//test march 25-26 lost money




const backTestParams = {
    testStart: testStart.valueOf(),
    testEnd: testEnd.valueOf(),
    balance: {
      makerCommission: 10,
      takerCommission: 10,
      buyerCommission: 0,
      sellerCommission: 0,
      canTrade: true,
      canWithdraw: true,
      canDeposit: true,
      balances: [
        { asset: 'ETH', free: '0.00000000', locked: '0.00000000' },
        { asset: 'USD', free: '500.00000000', locked: '0.00000000' },
      ]
    }
};

const client = new DBClient(backTestParams);

const runner = require("../core/runner");
runner(client, backTestParams.testStart).then(() => {
    console.log("should never happen");
}).catch((e:Error)=>{
    throw e;
});


