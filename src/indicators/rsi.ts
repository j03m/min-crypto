const RSI = require('technicalindicators').RSI;

export default {
    generate,
    name: "rsi"
}

function generate(data:Array<number>):number{
    const values = RSI.calculate({ values: data, period: 14 });
    return values[values.length -1];
}
