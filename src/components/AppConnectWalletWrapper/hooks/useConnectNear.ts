import { useEffect } from 'react';

import { SUPPORTED_NETWORK } from 'connectors/constants';
import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import { loginStart } from 'store/address/slice';
import { isAddressEqual } from 'services/WalletService/utils';
import { useWalletSelector } from 'context/NearWalletSelectorContext';

export const useConnectNear = () => {
  const dispatch = useAppDispatch();

  const { accountId: account, chainId: nearChainId, active } = useWalletSelector();

  const { address, chainId, network } = useAppSelector(selectedAddress.getAddress);

  useEffect(() => {
    if (
      network === SUPPORTED_NETWORK.NEAR &&
      (!isAddressEqual(account, address) || chainId.toString() !== nearChainId?.toString()) &&
      !!active &&
      !!account &&
      !!nearChainId
    ) {
      dispatch(loginStart({ address: account }));
    }
  }, [active, account, chainId, address, nearChainId, network]);
};
