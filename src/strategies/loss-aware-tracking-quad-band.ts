import Candle from "../types/candle";
import TrackingQuadBand from "./tracking-quad-band";
import Order from "../types/order";
import BigNumber from "bignumber.js";
export default {
    shouldBuy,
    shouldSell,
    orderPlaced,
    name: "loss-aware-tracking-quad-band"
}

const openOrders:Array<Order> = [];

function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return TrackingQuadBand.shouldBuy(indicators, candles);
}

function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const result = TrackingQuadBand.shouldSell(indicators, candles);
    const order:Order|undefined = openOrders[0];
    if (order === undefined){
        return false;
    }

    const price = new BigNumber(order.price);
    const lastCandle = candles[candles.length-1];
    const possibleSale = new BigNumber(lastCandle.close);

    //is our buy price larger then sell?
    const isLoss = price.isGreaterThanOrEqualTo(possibleSale);
    return result && !isLoss; //if its a loss negate what tracking band thinks
}

function orderPlaced(order:Order, indicators:Map<string, Array<any>>, candles:Array<Candle>){
    if (order.side === "BUY"){
        openOrders.push(order);
    }
    if (order.side === "SELL"){
        openOrders.shift();
    }
}