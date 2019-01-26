import Candle from "../types/candle";

import {isNewHigh} from "../utils/util";

export default {
    generate,
    name: "new-high"
}

import config from "../core/config";
const period = config.namedConfigs.get("new-high").period;

function generate(data:Array<Candle>):number{
    if (data.length < period){
        throw new Error(`Indicator new-high is set to a period of ${period} but received only ${data.length} bars`);
    }
    const result = isNewHigh(data, period);
    if (result){
        return 1
    }
    else{
        return 0
    }
}
