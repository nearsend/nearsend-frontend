import { FC, ReactNode, useEffect } from 'react';

import ModalWrongNetwork from 'components/Modal/components/ModalWrongNetwork';
import { handleSetWrongNetwork } from 'store/connection/slice';
import selectedAddress from 'store/address/selector';
import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import { SUPPORTED_CHAIN_IDS } from 'connectors/constants';
import { setAppAddress } from 'store/address/slice';
import { useConnectNear } from './hooks/useConnectNear';
import { useChainFactory } from 'hooks/walletHook/useChainFactory';
import useGetBalance from 'hooks/blockchainHook/useGetBalance';
import useNearWalletQueryParams from 'hooks/blockchainHook/useNearWalletQueryParams';
import { useWalletSelector } from 'context/NearWalletSelectorContext';

const AppConnectWalletWrapper: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const dispatch = useAppDispatch();

  const { chainId: appChainId, address } = useAppSelector(selectedAddress.getAddress);

  useConnectNear();
  useNearWalletQueryParams();

  const { accountId } = useWalletSelector();
  const { getConnectedStatus, connectedChainId } = useChainFactory(true);

  const { getNativeTokenBalance } = useGetBalance();

  useEffect(() => {
    if (accountId) {
      getNativeTokenBalance();
      dispatch(setAppAddress(accountId));
    }
  }, [accountId]);

  useEffect(() => {
    const checkConnectedStatus = () => {
      const isConnected = getConnectedStatus(appChainId);
      if (isConnected) {
        if (
          connectedChainId &&
          (!SUPPORTED_CHAIN_IDS.includes(connectedChainId) || connectedChainId?.toString() !== appChainId?.toString())
        ) {
          dispatch(handleSetWrongNetwork(true));
        } else {
          dispatch(handleSetWrongNetwork(false));
        }
      } else {
        dispatch(handleSetWrongNetwork(false));
      }
    };

    checkConnectedStatus();
  }, [appChainId, address, connectedChainId]);

  return (
    <>
      {children}

      <ModalWrongNetwork />
    </>
  );
};

export default AppConnectWalletWrapper;
