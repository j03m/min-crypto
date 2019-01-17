import Candle from "../types/candle";
import Order from "../types/order";
import BigNumber from "bignumber.js";
export default {
    shouldBuy,
    shouldSell,
    orderPlaced,
    name: "min-profit"
}

const openOrders:Array<Order> = [];
const threshold = 1;

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return true;
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const order:Order|undefined = openOrders[0];
    if (order === undefined){
        return false;
    }

    const price = new BigNumber(order.price);
    const lastCandle = candles[candles.length-1];
    const possibleSale = new BigNumber(lastCandle.close);

    //is our buy price larger then sell?
    const diff = possibleSale.minus(price).dividedBy(price).times(100);

    return diff.isGreaterThanOrEqualTo(threshold);
}

function orderPlaced(order:Order, indicators:Map<string, Array<any>>, candles:Array<Candle>){
    if (order.side === "BUY"){
        openOrders.push(order);
    }
    if (order.side === "SELL"){
        openOrders.shift();
    }
}