import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AccountState, NetworkId, WalletSelector, WalletSelectorState } from '@near-wallet-selector/core';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupLedger } from '@near-wallet-selector/ledger';
import ledgerIconUrl from '@near-wallet-selector/ledger/assets/ledger-icon.png';
import { setupMathWallet } from '@near-wallet-selector/math-wallet';
import mathWalletIconUrl from '@near-wallet-selector/math-wallet/assets/math-wallet-icon.png';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import meteorIconUrl from '@near-wallet-selector/meteor-wallet/assets/meteor-icon.png';
import { setupModal, WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import myNearWalletIconUrl from '@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';
import nearWalletIconUrl from '@near-wallet-selector/near-wallet/assets/near-wallet-icon.png';
import { setupNightly } from '@near-wallet-selector/nightly';
import nightlyIconUrl from '@near-wallet-selector/nightly/assets/nightly.png';
// import { setupNightlyConnect } from '@near-wallet-selector/nightly-connect';
// import nightlyConnectIconUrl from '@near-wallet-selector/nightly-connect/assets/nightly-connect.png';
import { setupSender } from '@near-wallet-selector/sender';
import senderIconUrl from '@near-wallet-selector/sender/assets/sender-icon.png';
import { setupWalletConnect } from '@near-wallet-selector/wallet-connect';
import walletConnectIconUrl from '@near-wallet-selector/wallet-connect/assets/wallet-connect-icon.png';
import { distinctUntilChanged, map } from 'rxjs';

import { CHAIN_ID, CONTRACT_ID, SUPPORTED_NETWORK } from 'connectors/constants';
import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import { logout, setAppChainId, setAppNetwork } from 'store/address/slice';
import { handleSetConnectedWalletType } from 'store/connection/slice';

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector | null;
  accounts: Array<AccountState>;
  accountId: string | null;
  chainId: string | NetworkId | null;
  active: boolean;
  modal: WalletSelectorModal | null;
  handleLogout: (signoutSuccessCallback?: () => void) => void;
}

const WalletSelectorContext = createContext<WalletSelectorContextValue | null>(null);
WalletSelectorContext.displayName = 'WalletSelectorContext';

export const WalletSelectorContextProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelectorContextValue['selector']>(null);
  const [modal, setModal] = useState<WalletSelectorContextValue['modal']>(null);
  const [accounts, setAccounts] = useState<WalletSelectorContextValue['accounts']>([]);
  const [chainId, setChainId] = useState<WalletSelectorContextValue['chainId']>(null);

  const { chainId: appChainId } = useAppSelector(selectedAddress.getAddress);

  const dispatch = useAppDispatch();

  const handleLogout = async (signoutSuccessCallback?: () => void) => {
    const wallet = await selector?.wallet();

    wallet
      ?.signOut()
      .then(() => {
        dispatch(logout());

        if (typeof signoutSuccessCallback === 'function') {
          signoutSuccessCallback();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleSetChainId = (chainId: string | NetworkId | null) => {
    if (appChainId?.toString() !== chainId?.toString()) {
      handleLogout();
      return;
    }
    dispatch(setAppChainId(chainId));
    setChainId(chainId);
  };

  useEffect(() => {
    const init = async () => {
      const network = appChainId || CHAIN_ID.NEAR_TEST;

      const _selector = await setupWalletSelector({
        network,
        debug: import.meta.env.DEV,
        modules: [
          setupNearWallet({
            iconUrl: nearWalletIconUrl,
          }),
          setupMyNearWallet({
            iconUrl: myNearWalletIconUrl,
          }),
          setupSender({
            iconUrl: senderIconUrl,
          }),
          setupMathWallet({
            iconUrl: mathWalletIconUrl,
          }),
          setupLedger({
            iconUrl: ledgerIconUrl,
          }),
          setupMeteorWallet({
            iconUrl: meteorIconUrl,
          }),
          setupWalletConnect({
            projectId: '.',
            metadata: {
              name: '',
              description: '',
              url: '',
              icons: [],
            },
            iconUrl: walletConnectIconUrl,
          }),
          setupNightly({ iconUrl: nightlyIconUrl }),
          // setupNightlyConnect({
          //   url: '',
          //   appMetadata: {
          //     additionalInfo: '',
          //     application: '',
          //     description: '',
          //     icon: nightlyConnectIconUrl,
          //   },
          // }),
        ],
      });

      const _modal = setupModal(_selector, { contractId: CONTRACT_ID[network as string], theme: 'light' });
      const state = _selector.store.getState();

      window.selector = _selector;
      window.modal = _modal;
      dispatch(setAppNetwork(SUPPORTED_NETWORK.NEAR));
      setChainId(network);
      setAccounts(state.accounts);
      setSelector(_selector);
      setModal(_modal);
    };

    init().catch((err) => {
      console.error(err);
    });
  }, [appChainId]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    //Set connected wallet name
    dispatch(
      handleSetConnectedWalletType({
        [SUPPORTED_NETWORK.NEAR]: localStorage.getItem('near-wallet-selector:selectedWalletId')?.replaceAll('"', ''),
      }),
    );

    handleSetChainId(selector?.options?.network?.networkId);
    const changeNetworkSubscription = selector.on('networkChanged', ({ networkId }) => {
      handleSetChainId(networkId);
    });

    const subscription = selector.store.observable
      .pipe(
        // @ts-ignore
        map((state: WalletSelectorState) => state?.accounts),
        distinctUntilChanged(),
      )
      .subscribe((nextAccounts: AccountState[]) => {
        console.log('Accounts Update', nextAccounts);

        setAccounts(nextAccounts);

        if (!nextAccounts || nextAccounts?.length === 0) handleLogout();
      });

    return () => {
      subscription.unsubscribe();
      changeNetworkSubscription.remove();
    };
  }, [selector]);

  const memoizedData = useMemo(
    () => ({
      selector,
      modal,
      accounts,
      accountId: accounts.find((account) => account.active)?.accountId || null,
      active: accounts?.length > 0,
      chainId,
      handleLogout,
    }),
    [selector, modal, accounts, chainId],
  );

  if (!selector) {
    return null;
  }

  return <WalletSelectorContext.Provider value={memoizedData}>{children}</WalletSelectorContext.Provider>;
};

export const useWalletSelector = () => {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error('useWalletSelector must be used within a WalletSelectorContextProvider');
  }

  return context;
};
