import { useChainFactory } from 'hooks/walletHook/useChainFactory';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import { WALLET_API } from 'connectors/constants';

export const useGetTokens = () => {
  const [ownedTokens, setOwnedTokens] = useState<string[]>([]);
  const [ownedTokensInfo, setOwnedTokensInfo] = useState<any[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  const { address, chainId } = useAppSelector(selectedAddress.getAddress);

  const { getConnectedChainInfo, getWallet } = useChainFactory();

  const getOwnedTokens = async () => {
    try {
      const response = await axios.get(`${WALLET_API[chainId]}/account/${address}/likelyTokens`);
      setIsLoadingTokens(true);

      if (response?.status === 200) {
        setOwnedTokens(response?.data);
      }
    } catch (e) {
      setOwnedTokens([]);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  useEffect(() => {
    const getOwnedTokensInfo = async () => {
      try {
        const { library } = getConnectedChainInfo() || {};
        const wallet = getWallet();
        setIsLoadingTokens(true);

        const response = await wallet?.getTokenMetadata({ library, data: { tokens: ownedTokens, batchLimit: 25 } });

        setOwnedTokensInfo(response);
      } catch (e) {
        setOwnedTokensInfo([]);
      } finally {
        setIsLoadingTokens(false);
      }
    };
    if (ownedTokens?.length > 0) {
      getOwnedTokensInfo();
    }
  }, [ownedTokens]);

  return { getOwnedTokens, isLoadingTokens, ownedTokensInfo, ownedTokens };
};
