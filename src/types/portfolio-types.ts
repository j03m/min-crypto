export interface Balance {
    free: string,
    locked: string
}

export interface BalanceForSymbol {
    asset: string,
    free: string,
    locked: string
}

export interface SymbolBalance {
    [key: string]: Balance
}


export interface AccountInfo {
    makerCommission: number,
    takerCommission: number,
    buyerCommission: number,
    sellerCommission: number,
    canTrade: boolean,
    canWithdraw: boolean,
    canDeposit: boolean,
    balances: Array<BalanceForSymbol>
}