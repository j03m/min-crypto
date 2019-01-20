import QuandBandIndicator, {QuadBand} from "./quad-band";
import Candle from "../types/candle";
import {getBigNumbers, getNumbers, getProperty} from "../utils/util";

export default {
    generate,
    name: "fast-quad-band"
}

function generate(data: Array<Candle>): QuadBand {
    return QuandBandIndicator.generate(data, 20);
}