import { convertToBigNumber } from './utils/number';
import { BigNumber } from 'bignumber.js';
import { ValidationError } from 'yup';

import { INIT_UNIT_256, INIT_UNIT_128 } from './constants/index';

export default class BaseWalletService {
  address: string | null;
  needTobeInitiated: any;
  initUnit256: any;
  initUnit128: any;

  constructor(props: any) {
    this.address = props?.address;
    this.initUnit128 = INIT_UNIT_128;
    this.initUnit256 = INIT_UNIT_256;
  }

  isAddress(address: string): boolean | ValidationError | Promise<boolean | ValidationError> {
    return false;
  }

  getBalance = async ({
    library,
    account,
    data,
  }: {
    library: any;
    account: string;
    data: {
      token: string;
    };
  }): Promise<BigNumber> => {
    return new Promise((resolve) => resolve(convertToBigNumber(0)));
  };

  getStatusCheckCurrency = async ({
    library,
    account,
    data,
  }: {
    library: any;
    account: string;
    data: {
      tokenAddress: string;
      exchangeAddress: string;
      tokenKey: string;
    };
  }): Promise<boolean> => {
    return new Promise((resolve) => resolve(false));
  };

  approveCurrency = async ({
    library,
    account,
    data,
    callback,
  }: {
    library: any;
    account: string;
    data: {
      tokenAddress: string;
      exchangeAddress: string;
      tokenKey: string;
    };
    callback: {
      success: () => void;
      failed: () => void;
    };
  }) => {};

  signMessage = async ({ library, account }: { library: any; account: string }) => {};

  changeNetwork = async ({ library, data }: { library: any; data: { chainId: number | string } }) => {};

  addToken = async ({
    library,
    data,
  }: {
    library: any;
    data: {
      tokenType: string;
      tokenAddress: string;
      tokenSymbol: string;
      tokenDecimals: number;
      tokenImage?: string;
      chainId?: string;
    };
  }) => {};

  getTotalSupply = ({
    library,
    data,
  }: {
    library: any;
    data: {
      tokenInfo: any;
    };
  }): any => {
    return undefined;
  };
}
