import {AccountInfo} from "./portfolio-types";

export default interface BackTestOptions {
    testStart: number,
    testEnd: number,
    balance: AccountInfo
}