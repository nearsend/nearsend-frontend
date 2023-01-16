import { useEffect, useState } from 'react';

import { useAppSelector } from 'hooks/useStore';
import { CHAIN_ID } from 'connectors/constants';
import selectedAddress from 'store/address/selector';
import { ChainFactory } from 'utils/chains/ChainFactory';
import NearChainService from 'services/WalletService/NearChainService';
import { useWalletSelector } from 'context/NearWalletSelectorContext';

export const useChainFactory = (checkConnectedChainId = false) => {
  const { chainId: appChainId } = useAppSelector(selectedAddress.getAddress);

  const {
    active: isConnectingNear,
    accountId: nearAccount,
    chainId: nearChainId,
    selector: nearLibrary,
  } = useWalletSelector();

  const [connectedChainId, setConnectedChainId] = useState<string | number | null | undefined>(undefined);

  const getConnectedChainInfo = (chainId = '') => {
    if (!chainId && !appChainId) {
      return null;
    }

    switch (chainId?.toString() || appChainId?.toString()) {
      case CHAIN_ID.NEAR_TEST:
      case CHAIN_ID.NEAR:
        return {
          chainId: nearChainId,
          account: nearAccount,
          library: nearLibrary,
          active: isConnectingNear,
        };
    }
  };

  const getConnectedStatus = (chainId: string | number): boolean => {
    if (!chainId) {
      return false;
    }

    switch (chainId?.toString()) {
      case CHAIN_ID.NEAR_TEST:
      case CHAIN_ID.NEAR:
        return isConnectingNear;
    }

    return false;
  };

  const getWallet = (chainId = undefined): NearChainService | undefined => {
    if (!chainId && !appChainId) {
      return undefined;
    }

    return new ChainFactory().getChain(chainId || appChainId)?.getService() as NearChainService;
  };

  useEffect(() => {
    const checkChainId = () => {
      const { chainId } = getConnectedChainInfo() || {};
      setConnectedChainId(chainId as string);
    };

    if (checkConnectedChainId) {
      checkChainId();
    }
  }, [nearAccount, nearChainId]);

  return {
    getConnectedChainInfo,
    getConnectedStatus,
    getWallet,
    connectedChainId,
  };
};
