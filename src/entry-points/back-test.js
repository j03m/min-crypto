"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.on('unhandledRejection', up => { throw up; });
const db_client_1 = require("../clients/db-client");
const moment = require("moment");
const testStart = moment(new Date(2017, 11, 18));
const testEnd = testStart.clone();
testEnd.add(100, "d");
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
const client = new db_client_1.default(backTestParams);
const runner = require("../core/runner");
runner(client, backTestParams.testStart).then(() => {
    console.log("should never happen");
}).catch((e) => {
    throw e;
});
//# sourceMappingURL=back-test.js.map