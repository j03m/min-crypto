export default interface Candle {
    [key:string]: Date | string,
    opentime: Date,
    symbol: string,
    open: string,
    high: string,
    low: string,
    close: string,
    volume: string
};