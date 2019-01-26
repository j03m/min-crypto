/**



 IF +DI AND -DI are both positive AND +DI > -DI
 THEN +DI = Current High – Previous High AND –DI = 0
 Else IF +DI < -DI
 THEN +DI = 0 AND –DI = Previous Low – Current Low
 **/

import Candle from "../types/candle";
import BigNumber from "bignumber.js";

export default {
    generate,
    name: "directional"
}

function generate(data:Array<Candle>):number{
    if (data.length < 2){
        throw new Error("we need two candles min")
    }
    const current = data[data.length -1];
    const previous = data[data.length -2];
    const currentHigh = new BigNumber(current.high);
    const currentLow = new BigNumber(current.low);
    const previousHigh = new BigNumber(previous.high);
    const previousLow = new BigNumber(previous.low);

    // +DI
    // IF Current High – Previous High > Previous Low – Current Low
    // THEN +DI = the greater of Current High – Previous High OR 0
    const zero = new BigNumber(0);
    let pDI = zero;
    const highDiff = currentHigh.minus(previousHigh);
    const lowDiff = previousLow.minus(currentLow);
    if(highDiff.isGreaterThan(lowDiff)){
        pDI = highDiff.isGreaterThan(0) ? highDiff : pDI;
    }

    // -DI
    // IF Previous Low – Current Low > Current High – Previous High
    // THEN –DI = the greater of Previous Low – Current Low OR 0
    let nDI = zero;
    if (lowDiff.isGreaterThan(highDiff)){
        nDI = lowDiff.isGreaterThan(0) ? lowDiff : nDI;
    }

    // IF +DI AND -DI are both positive AND +DI > -DI
    // THEN +DI = Current High – Previous High AND –DI = 0
    if(nDI.isGreaterThan(0) && pDI.isGreaterThan(0) && pDI.isGreaterThan(nDI)){
        nDI = zero;
    }
    else if( nDI.isGreaterThan(0) && pDI.isGreaterThan(0) && nDI.isGreaterThan(pDI)){
        pDI = zero;
    }

    if (nDI.isEqualTo(zero) && pDI.isEqualTo(zero)){
        return 0;
    }

    if (pDI.isGreaterThan(nDI)){
        return 1;
    }

    if (nDI.isGreaterThan(pDI)){
        return -1;
    }

    throw new Error("Programmer Error");
}
