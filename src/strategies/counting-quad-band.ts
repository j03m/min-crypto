export default {
    shouldBuy,
    shouldSell,
    name: "quad-band"
}

const bars = 3;

const Advice = require("./advice");
function shouldBuy(indicators:Map<string, Array<any>>, prices:Array<number>):boolean{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("quad-band strategy requires the quad-band indicator", bandHistory);
        throw new Error("quad-band strategy requires the quad-band indicator");
    }

    return determineSignal(prices, bandHistory, "hasBuySignal");
}

function determineSignal(prices:Array<number>, bandHistory:Array<any>, method:string): boolean{
    const start = bandHistory.length -1;
    const end = start - bars;
    if (end < 0){
        return false;
    }

    let result = true;
    for (let i = start; i > end; i--){
        const price = prices[i];
        result = result && Advice[method](price, bandHistory[i]);
    }
    return result;
}

function shouldSell(indicators:Map<string, Array<any>>, prices:Array<number>):boolean{
    const bandHistory = indicators.get("quad-band");
    if (bandHistory === undefined || bandHistory.length <=0){
        console.log("quad-band strategy requires the quad-band indicator", bandHistory);
        throw new Error("quad-band strategy requires the quad-band indicator");
    }

    return determineSignal(prices, bandHistory, "hasSellSignal");
}