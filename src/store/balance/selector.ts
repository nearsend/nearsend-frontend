import isEmpty from 'lodash/isEmpty';
import { ChainFactory } from 'utils/chains/ChainFactory';

const selectBalance = {
  getBalance: (token?: string) => (state: any) => {
    if (isEmpty(state?.BalanceSlice?.balance)) {
      return null;
    }

    const { chainId, tokenInfo } = state?.AddressSlice;
    const chainInstance = new ChainFactory()?.getChain(chainId);

    return chainInstance?.getBalance(state?.BalanceSlice?.balance, chainId, token ? token : tokenInfo) || 0;
  },
};

export default selectBalance;
