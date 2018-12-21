const BN = require("bignumber.js");
const BandGenerator = require('technicalindicators').BollingerBands;
module.exports = {

  makeBand(data, period, stdDev){
    return BandGenerator.calculate({
      period: period,
      values: data,
      stdDev: stdDev
    })[0];
  },
  makeGuide(innerBand, outerBand){
    if (!innerBand && !outerBand){
      return {};
    }
    return {
      top: BN(outerBand.upper),
      high: BN(innerBand.upper),
      mid: BN(innerBand.middle),
      low: BN(innerBand.lower),
      bottom: BN(outerBand.lower)
    }
  }
};