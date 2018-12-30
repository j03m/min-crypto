import Candle from "./candle";
export default interface Indicator {
    name: string,
    generate:(input:Array<Candle>) => Array<any>
};