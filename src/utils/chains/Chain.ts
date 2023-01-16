export class Chain {
  constructor() {}

  getInstance<T>(): T | null {
    return null;
  }

  removeInstance() {}

  getBalance(
    balance: Record<string | number, Record<string, number>>,
    chainId: string | number,
    token: string,
  ): string | number {
    return balance?.[chainId]?.[token];
  }

  getService(): any {
    return null;
  }

  getUtils(): any {
    return null;
  }
}
