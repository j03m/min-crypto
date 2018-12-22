export default interface Indicator {
    name: string,
    generator:(input:Array<number>) => Array<number>
};