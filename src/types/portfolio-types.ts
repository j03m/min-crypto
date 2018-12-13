export interface Balance {
    free: string,
    locked: string
}

export interface SymbolBalance {
    [key: string]: Balance
};
