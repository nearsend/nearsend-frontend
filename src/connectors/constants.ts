import NearIcon from 'resources/svg/near_icon.svg';

export const CHAIN_ID: Record<any, string> = {
  NEAR_TEST: 'testnet',
  NEAR: 'mainnet',
};

export const CONTRACT_ID: Record<any, string> = {
  [CHAIN_ID.NEAR_TEST]: import.meta.env.VITE_CONTRACT_ID_TESTNET,
  [CHAIN_ID.NEAR]: import.meta.env.VITE_CONTRACT_ID_MAINNET,
};

export const WALLET_API: Record<any, string> = {
  [CHAIN_ID.NEAR_TEST]: import.meta.env.VITE_NEAR_WALLET_URL_TESTNET,
  [CHAIN_ID.NEAR]: import.meta.env.VITE_NEAR_WALLET_URL_MAINNET,
};

export const ARCHIVAL_NETWORK: Record<any, string> = {
  [CHAIN_ID.NEAR_TEST]: import.meta.env.VITE_ARCHIVAL_NETWORK_URL_RPC_TESTNET,
  [CHAIN_ID.NEAR]: import.meta.env.VITE_ARCHIVAL_NETWORK_URL_RPC_MAINNET,
};

export const SUPPORTED_NETWORK = {
  NEAR: 'NEAR',
};

export const NATIVE_TOKEN = 'NEAR';
export const NATIVE_TOKEN_DECIMAL_SCALE = 24;

export const SUPPORTED_CHAIN_IDS: (string | number)[] = [CHAIN_ID.NEAR, CHAIN_ID.NEAR_TEST];

export const NEAR_WALLET = 'near-wallet';
export const MY_NEAR_WALLET = 'my-near-wallet';
export const SENDER = 'sender';

export const BROWSER_WALLETS = [NEAR_WALLET, MY_NEAR_WALLET];
export const SUPPORT_CONNECT_TYPE = [NEAR_WALLET, SENDER];

type CHAIN_INFO_TYPE = {
  name: string;
  valueString: string;
  icon: string | null;
  textWarning: string;
  url: string;
  suffixToken: string;
  explorerName: string;
  suffixKey: string;
  shortName: string;
  key: string;
};

export const WALLET_NAME: Record<string, string> = {
  //EVM
  [NEAR_WALLET]: 'common.near_wallet',
  [SENDER]: 'common.sender',
};

export const CHAIN_INFO: Record<string | number, CHAIN_INFO_TYPE> = {
  [CHAIN_ID.NEAR_TEST]: {
    name: 'NEAR Testnet',
    valueString: CHAIN_ID.NEAR_TEST,
    icon: NearIcon,
    textWarning: 'Near - Testnet',
    url: 'https://testnet.nearblocks.io',
    suffixToken: '',
    explorerName: 'Near Explorer',
    suffixKey: '',
    shortName: 'Near',
    key: 'Near',
  },
  [CHAIN_ID.NEAR]: {
    name: 'NEAR Mainnet',
    valueString: CHAIN_ID.NEAR,
    icon: NearIcon,
    textWarning: 'Near - Testnet',
    url: 'https://nearblocks.io',
    suffixToken: '',
    explorerName: 'Near Explorer',
    suffixKey: '',
    shortName: 'Near',
    key: 'Near',
  },
};
