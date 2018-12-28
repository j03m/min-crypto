import OrderId from "./order-id";
import {SymbolBalance} from "./portfolio-types";
import Order from "./order";

export default interface Update {
    eventType: string,
    eventTime: number,
    orderId?: OrderId | number,
    order?: Order
    balances?: SymbolBalance
}



export interface UpdateHandler {
    (update:Update):void
}