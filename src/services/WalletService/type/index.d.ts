import { WalletSelector } from '@near-wallet-selector/core';

type AppProvider = WalletSelector;
type Extract<T extends AppProvider, A = AppProvider> = A extends T ? A : never;

export type NearProvider = AppProvider;
