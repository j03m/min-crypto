import Config from "./config";
const {buySeverity, sellSeverity} = Config;
const BN = require("bignumber.js");


class Advice{
    static hasBuySignal(last, spec) {
        //if the last price is between
        if (buySeverity === "aggressive"){
            return Advice.hasAggressiveBuySignal(last, spec);
        }

        if (buySeverity === "midline"){
            return Advice.hasMidlineBuySignal(last, spec);
        }

        if (buySeverity === "conservative"){
            return Advice.hasConservativeBuySignal(last, spec);
        }
        return false;
    }

    static hasSellSignal(last, spec) {
        if (sellSeverity === "aggressive"){
            return Advice.hasAggressiveSellSignal(last, spec);
        }

        if (sellSeverity === "midline"){
            return Advice.hasMidlineSellSignal(last, spec);
        }

        if (sellSeverity === "conservative"){
            return Advice.hasConservativeSellSignal(last, spec);
        }
        return false;
    }

    /**
     * For an aggressive buyer (buy often), we buy anytime we are at more below hold
     * @param {number[]} last
     * @param {OrderSpec} spec
     */
    static hasAggressiveBuySignal(last, spec){
        return last.isLessThanOrEqualTo(spec.mid);
    }

    /**
     * Midline buy means we should buy we are at or bloe the midBuy
     * @param {OHLCV} last
     * @param {OrderSpec} spec
     * @returns {boolean}
     */
    static hasMidlineBuySignal(last, spec){
        return last.isLessThanOrEqualTo(spec.low);
    }

    /**
     * conservative buy means we should buy if below lowBuy line
     * @param {OHLCV} last
     * @param {OrderSpec} spec
     * @returns {boolean}
     */
    static hasConservativeBuySignal(last, spec){
        return last.isLessThanOrEqualTo(spec.bottom);
    }

    /**
     * For an aggressive seller, (sell often)
     * @param {number[]} last
     * @param {OrderSpec} spec
     */
    static hasAggressiveSellSignal(last, spec){
        return last.isGreaterThanOrEqualTo(spec.mid);
    }

    /**
     * Midline sell means we should sell above low sell
     * @param {OHLCV} last
     * @param {OrderSpec} spec
     * @returns {boolean}
     */
    static hasMidlineSellSignal(last, spec){
        return last.isGreaterThanOrEqualTo(spec.high);
    }

    /**
     * conservative sell means we should only if above high sell
     * @param {OHLCV} last
     * @param {OrderSpec} spec
     * @returns {boolean}
     */
    static hasConservativeSellSignal(last, spec){
        return last.isGreaterThanOrEqualTo(spec.top);
    }

    static hasBandWidth(currentBand, bands){
        const currentWidth = Advice.calculateWidth(currentBand);
        const sumWidth = bands.reduce((acc, band) => {
             return acc.plus(Advice.calculateWidth(band));
        }, BN(0));
        const avgWidth = sumWidth.dividedBy(bands.length);
        return currentWidth.isGreaterThanOrEqualTo(avgWidth);
    }

    static calculateWidth({top, bottom, mid}){
        return top.minus(bottom).dividedBy(mid).times(100);
    }
}

module.exports = Advice;