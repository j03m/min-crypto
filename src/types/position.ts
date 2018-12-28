import BigNumber from "bignumber.js";
export default interface Position {
    quantity:BigNumber,
    price: BigNumber,
    originalOrderId: string,
}