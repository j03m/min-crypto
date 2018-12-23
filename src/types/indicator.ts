import {BigNumber} from "bignumber.js";
export default interface Indicator {
    name: string,
    generator:(input:Array<BigNumber>) => Array<any>
};