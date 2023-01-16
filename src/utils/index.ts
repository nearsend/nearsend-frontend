import { CHAIN_INFO } from 'connectors/constants';
import TYPE_CONSTANTS from 'constants/type';

export const isExternalLink = (link?: string) => {
  return !!(link?.includes('http') || link?.includes('https'));
};

export const getParamSort = (sorter: any) => {
  const { order, field: sortField } = sorter;
  const sortType = order && order === 'descend' ? TYPE_CONSTANTS.SORT_FORMAT.DESC : TYPE_CONSTANTS.SORT_FORMAT.ASC;

  const sortParams: {
    sortField?: string;
    sortType?: number;
  } = {
    sortField,
    sortType,
  };

  if (!order) {
    delete sortParams.sortField;
    delete sortParams.sortType;
  }

  return sortParams;
};

export const getNetWorkByChainId = (chainId: number | string | null, listToken: any[] = []) => {
  if (!chainId) return {};

  return listToken?.find((item) => item?.chainId === chainId);
};

export const getNetWorkByChainName = (name: string | null, listToken: any[] = []) => {
  if (!name) return {};

  return listToken.find((item) => item?.name === name);
};

export const getTokenInfoByChainId = (configToken: any, chainId: string, token: string): any => {
  return Object.values(configToken?.[chainId])?.find(({ token: currentToken }: any) => currentToken === token) || {};
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const convertToListNetworkName = (listChainId: (string | number)[], delimiter: string) => {
  return listChainId.map((chainId: string | number) => CHAIN_INFO[chainId]?.name).join(delimiter);
};
