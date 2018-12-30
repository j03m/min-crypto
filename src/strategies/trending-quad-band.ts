// /**
//  * Note we did this wrong. We should have just made a isTrending indicator and ANDed it with the
//  * counting quad band
//  */
//
// import {QuadBand} from "../indicators/quad-band";
//
// export default {
//     shouldBuy,
//     shouldSell,
//     name: "trending-quad-band"
// }
//
// import CountingQuadBand from "./counting-quad-band";
// import BigNumber from "bignumber.js";
//
//
// const lookBack = 4;
//
// /**
//  * Sell if the counting indicator says to, but not if we look like we're trending
//  * wait for the trend to end
//  * @param indicators
//  * @param prices
//  */
// function shouldSell(indicators:Map<string, Array<any>>, prices:Array<BigNumber>):boolean{
//     const result = CountingQuadBand.shouldSell(indicators, prices);
//     const bandHistory = indicators.get("quad-band");
//     if (bandHistory === undefined || bandHistory.length <=0){
//         console.log("trending quad-band strategy requires the quad-band indicator", bandHistory);
//         throw new Error("quad-band strategy requires the quad-band indicator");
//     }
//
//     const isTrending = determinSignal(bandHistory, prices, (price:BigNumber, band:QuadBand) => {
//         return price.isGreaterThanOrEqualTo(band.top);
//     });
//     return result && !isTrending;
//
// }
//
// interface Checker {
//     (price:BigNumber, band:QuadBand): boolean
// }
//
// function determinSignal(bandHistory:Array<QuadBand>, prices:Array<BigNumber>, checker:Checker){
//     //check if trending
//     const start = prices.length -1;
//     const end = start - lookBack;
//     if (end < 0){
//         return false;
//     }
//
//     let isTrending = false;
//     //if any price >= the top band, we shouldn't sell even if the strategy says to
//     for (let i = start; i > end; i--){
//         const price:BigNumber = prices[i];
//         const band:QuadBand = bandHistory[i] as QuadBand;
//         isTrending =  isTrending || checker(price, band);
//     }
//     return isTrending;
// }
//
//
// /**
//  * Buy if the counting indicator says to, but not if we look like we're trending
//  * wait for the trend to end
//  * @param indicators
//  * @param prices
//  */
// function shouldBuy(indicators:Map<string, Array<any>>, prices:Array<BigNumber>):boolean{
//     const result = CountingQuadBand.shouldBuy(indicators, prices);
//     const bandHistory = indicators.get("quad-band");
//     if (bandHistory === undefined || bandHistory.length <=0){
//         console.log("trending quad-band strategy requires the quad-band indicator", bandHistory);
//         throw new Error("quad-band strategy requires the quad-band indicator");
//     }
//
//     const isTrending = determinSignal(bandHistory, prices, (price:BigNumber, band:QuadBand) => {
//         return price.isLessThanOrEqualTo(band.bottom);
//     });
//     return result && !isTrending;
// }