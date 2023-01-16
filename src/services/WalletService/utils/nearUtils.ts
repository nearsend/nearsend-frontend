import get from 'lodash/get';
import { utils } from 'near-api-js';

import { convertBase64ToObj } from '.';
import { NearProvider } from '../type';
import { dividedPrice } from './number';

export const getSendFtTokenParamsFromReceipt = (receipt: any, tokenInfo: any) => {
  const {
    msg = '',
    amount = 0,
    receiver_id = '',
  } = convertBase64ToObj(get(receipt, ['receipt', 'Action', 'actions', '0', 'FunctionCall', 'args'])) || {};

  return {
    address: receiver_id || msg?.split(':')?.[0] || '',
    amount: dividedPrice(amount, tokenInfo?.decimals).toString() || 0,
  };
};

export const formatNearAmount = (amount: string) => {
  return utils.format.formatNearAmount(amount).replace(/,/gi, '');
};

export const getSendNEARAmountFromReceipt = (receipt: any) => {
  const amount = formatNearAmount(get(receipt, ['receipt', 'Action', 'actions', '0', 'Transfer', 'deposit']) || 0);

  return amount;
};

export const getContractId = (library: NearProvider) => library.store.getState().contract?.contractId || '';
