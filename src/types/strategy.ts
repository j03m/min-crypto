export default interface Strategy {
    name:string,
    shouldBuy:(indicatorMap:Map<string, Array<any>>, prices:Array<number>) => boolean,
    shouldSell:(indicatorMap:Map<string, Array<any>>, prices:Array<number>) => boolean,
}