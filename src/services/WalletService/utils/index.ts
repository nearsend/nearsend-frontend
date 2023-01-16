import { CHAIN_INFO } from 'connectors/constants';

export const getBlockExplorerLink = (chainId: number, txId: string) => {
  return `${CHAIN_INFO?.[chainId]?.url}/txns/${txId}`;
};

export const getBlockExplorerAccountLink = (chainId: number, account: string) => {
  return `${CHAIN_INFO?.[chainId]?.url}/address/${account}`;
};

export const getBlockExplorerName = (chainId: number) => {
  return CHAIN_INFO?.[chainId]?.explorerName;
};

export const isAddressEqual = (address1?: string | null, address2?: string | null) => {
  return !!address1 && !!address2 && address1?.toLowerCase() === address2?.toLocaleLowerCase();
};

export const convertBase64ToObj = (args: string): any => {
  if (!!args) {
    let base64ToString = Buffer.from(args, 'base64').toString();
    base64ToString = JSON.parse(base64ToString);

    return base64ToString;
  }
  return {};
};
