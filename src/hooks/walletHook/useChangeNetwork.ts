import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import useGetWalletService from './useGetWalletService';

export const useChangeNetwork = () => {
  const dispatch = useAppDispatch();

  const { library } = { library: null };

  const { wallet } = useGetWalletService();

  const { chainId: beforeChangeChainId } = useAppSelector(selectedAddress.getAddress);
  const targetChainId = '';

  const switchNetwork = async () => {
    try {
      const changeNetworkResponse = await wallet?.changeNetwork({
        library,
        data: {
          chainId: targetChainId,
        },
      });

      //Reject metamask => change back to change before
      if (changeNetworkResponse === undefined) {
        // dispatch(handleSetTargetChainId(beforeChangeChainId));
      }

      //Accepted change network => reset state
      if (changeNetworkResponse) {
        // dispatch(handleSetTargetChainId(null));
      }

      return changeNetworkResponse;
    } catch (e: any) {
      console.log(e);
      return false;
    }
  };

  useEffect(() => {
    if (targetChainId) {
      switchNetwork();
    }
  }, [targetChainId]);

  return {
    switchNetwork,
  };
};
