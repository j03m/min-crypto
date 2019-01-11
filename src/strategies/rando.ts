/**
 * Rando posits that humans actually suck at market predictions. It says that picking
 * random entry points and then entering or exiting based on perfomance of said position,
 * then randomly entering again will beat all of my flailings at beating the market.
 *
 * use with config.stoploss @ 100% as it handles stop loss
 *
 * Obviously a joke, but this is great for testing if your just lucky :) if rando beats your
 * strategy maybe you should rethink it? :)
 */

import Candle from "../types/candle";
import Order from "../types/order";
import BigNumber from "bignumber.js";

export default {
    shouldBuy,
    shouldSell,
    orderPlaced,
    name: "rando"
}

const chance = 50; //50% chance must be <= 100
const openOrders:Array<Order> = [];
const optimism = 10;
const pessimism = -3;
function shouldBuy(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    return Math.floor(Math.random() * 101) <= chance ? true : false;
}


function shouldSell(indicators:Map<string, Array<any>>, candles:Array<Candle>):boolean{
    const currentOrder:Order = openOrders[0];
    if (currentOrder === undefined){
        return false;
    }

    const lastCandleHigh:BigNumber = new BigNumber(candles[candles.length -1].high);
    const positionPrice = new BigNumber(currentOrder.price);
    const diff = percentChange(positionPrice, lastCandleHigh);

    if (diff.isGreaterThanOrEqualTo(optimism) || diff.isLessThan(pessimism)){
        return true;
    }

    return false;
}

function percentChange(base:BigNumber, change:BigNumber){
    return (base.minus(change).dividedBy(base)).times(100);
}

function orderPlaced(order:Order, indicators:Map<string, Array<any>>, candles:Array<Candle>){
    if (order.side === "BUY"){
        openOrders.push(order);
    }
    if (order.side === "SELL"){
        openOrders.shift();
    }
}