import { convertToBigNumber } from 'services/WalletService/utils/number';
import { NATIVE_TOKEN } from 'connectors/constants';
import { BigNumber } from 'bignumber.js';
import { useState } from 'react';

import { setAppToken } from 'store/address/slice';
import { useChainFactory } from '../walletHook/useChainFactory';
import { useAppDispatch } from 'hooks/useStore';
import { setBalance } from 'store/balance/slice';
import showMessage from 'components/Message';
import TYPE_CONSTANTS from 'constants/type';
import { NetworkId, Options } from '@near-wallet-selector/core/lib/options.types';

const useGetBalance = () => {
  const dispatch = useAppDispatch();

  const { getConnectedChainInfo, getWallet } = useChainFactory();

  const [isGettingBalance, setIsGettingBalance] = useState(false);
  const [hasGetBalance, setHasGetBalance] = useState(false);

  const handleSetBalance = (
    chainId: NetworkId | null | string | undefined,
    token: string,
    amount: BigNumber,
  ): Promise<string | number | undefined> => {
    const amountString = amount.toString();

    dispatch(
      setBalance({
        chainId,
        token,
        amount: amountString,
      }),
    );

    return new Promise((resolve) => {
      resolve(amountString);
    });
  };

  const handleErrorMessage = (options: Options | undefined) => {
    const { network } = options || {};

    showMessage(TYPE_CONSTANTS.MESSAGE.ERROR, 'message.E20', {
      interpolation: { escapeValue: false },
      rpc: network?.nodeUrl || 'NEAR RPC',
    });
  };

  const getBalance = async (token: string): Promise<string | number | undefined> => {
    const { chainId, account, library } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    setIsGettingBalance(true);
    setHasGetBalance(false);

    try {
      if (account && chainId && library && token) {
        const userBalance = await wallet?.getBalance({
          library,
          account,
          data: {
            token,
          },
        });

        if (userBalance) {
          const balance = userBalance || 0;

          dispatch(setAppToken(token));
          return handleSetBalance(chainId, token, balance);
        }
      }
    } catch (e) {
      handleErrorMessage(library?.options);
      return handleSetBalance(chainId, token, convertToBigNumber(0));
    } finally {
      setIsGettingBalance(false);
      setHasGetBalance(true);
    }
  };

  const getNativeTokenBalance = async (): Promise<string | number | undefined> => {
    const { chainId, account, library } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    setIsGettingBalance(true);
    setHasGetBalance(false);

    try {
      if (account && chainId && library) {
        const userBalance = await wallet?.getBalance({
          library,
          account,
        });

        if (userBalance) {
          const balance = userBalance || 0;

          return handleSetBalance(chainId, NATIVE_TOKEN, balance);
        }
      }
    } catch (e) {
      handleErrorMessage(library?.options);
      return handleSetBalance(chainId, NATIVE_TOKEN, convertToBigNumber(0));
    } finally {
      setIsGettingBalance(false);
      setHasGetBalance(true);
    }
  };

  return {
    getBalance,
    getNativeTokenBalance,
    isGettingBalance,
    hasGetBalance,
  };
};

export default useGetBalance;
