import Candle from "../types/candle";

import {isNewLow} from "../utils/util";

export default {
    generate,
    name: "new-low"
}

import config from "../core/config";
const period = config.namedConfigs.get("new-low").period;

function generate(data:Array<Candle>):number{
    if (data.length < period){
        throw new Error(`Indicator new-low is set to a period of ${period} but received only ${data.length} bars`);
    }
    const result = isNewLow(data, period);
    if (result){
        return 1
    }
    else{
        return 0
    }
}
