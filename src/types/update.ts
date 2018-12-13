import OrderId from "./order-id";
import {SymbolBalance} from "./portfolio-types";

export default interface Update {
    eventType: string,
    orderId: OrderId | number
}


export interface AccountUpdate {
    evenType:string,
    eventTime:number,
    balances: SymbolBalance
}

export interface UpdateHandler {
    (update:Update | AccountUpdate):void
}