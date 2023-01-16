import { useEffect, useState } from 'react';

import { ChainFactory } from 'utils/chains/ChainFactory';
import selectedAddress from 'store/address/selector';
import NearChainService from 'services/WalletService/NearChainService';
import { useAppSelector } from 'hooks/useStore';

const useGetWalletService = () => {
  const [wallet, setWallet] = useState<NearChainService | undefined>(undefined);
  const { chainId } = useAppSelector(selectedAddress.getAddress);

  useEffect(() => {
    const walletService = new ChainFactory().getChain(chainId);

    setWallet(walletService?.getService());
  }, [chainId]);

  return { wallet };
};

export default useGetWalletService;
