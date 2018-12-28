export default {
    shouldBuy,
    shouldSell,
    name: "quad-band"
}

const Advice = require("./advice");
function shouldBuy(indicators:Map<string, Array<any>>, prices:Array<number>):boolean{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined){
        throw new Error("quad-band strategy requires the quad-band indicator");
    }
    const price = prices[prices.length -1];
    return Advice.hasBuySignal(price, bandHistory[bandHistory.length-1]);
}

function shouldSell(indicators:Map<string, Array<any>>, prices:Array<number>):boolean{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined){
        throw new Error("quad-band strategy requires the quad-band indicator");
    }
    const price = prices[prices.length -1];
    return Advice.hasSellSignal(price, bandHistory[bandHistory.length-1]);
}