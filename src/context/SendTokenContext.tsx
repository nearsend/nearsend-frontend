import { FC, useContext, useState, createContext, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import selectSendToken from 'store/sendToken/selector';
import { setSendTokenInfo } from 'store/sendToken/slice';
import { PERSIST_DATA_PAGES } from 'constants/routes';
import { setQueryParams } from 'store/global/slice';
import { STEPS_LINK } from 'pages/home';
import selectedAddress from 'store/address/selector';

interface SendTokenContextValue {
  listAddressToSend: any[];
  setListAddressToSend: (listAddressToSend: any[]) => void;
  totalTransactions: number;
  setTotalTransactions: (totalTransactions: number) => void;
  tokenInfo: any;
  setTokenInfo: (tokenInfo: any) => void;
  currentStep: number | string;
  setCurrentStep: (currentStep: number) => void;
  listAddress: any[];
  setListAddress: (listAddress: any[]) => void;
}

export const STEPS = {
  PREPARE: 0,
  SETUP: 1,
  SUMMARY: 2,
  SEND: 3,
};
export const CHUNK_SIZE = {
  NATIVE_TOKEN: 100,
  FT_TOKEN: 30,
};

export const INITIAL_STEP = STEPS.PREPARE;

const SendTokenContext = createContext<SendTokenContextValue | null>(null);

export const SendTokenContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();

  const dispatch = useAppDispatch();

  const [listAddress, setListAddress] = useState<any[]>(
    // Array.from({ length: 5 }, (v, i) => ({ address: `landt${i ? i : ''}.testnet`, amount: 1 })),
    [],
  );
  const [listAddressToSend, setListAddressToSend] = useState<any[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentStep, setCurrentStep] = useState<number | string>('');

  const tokenInfo = useAppSelector(selectSendToken.getSendTokenInfo);
  const { address } = useAppSelector(selectedAddress.getAddress);

  const resetData = useCallback(() => {
    setListAddress([]);
    setListAddressToSend([]);
    setTotalTransactions(0);
    setCurrentStep(INITIAL_STEP);
    setTokenInfo(null);
  }, []);

  const setTokenInfo = useCallback((payload: any) => {
    dispatch(setSendTokenInfo(payload));
  }, []);

  const memoizedData = useMemo(
    () => ({
      listAddressToSend,
      setListAddressToSend,
      totalTransactions,
      setTotalTransactions,
      tokenInfo,
      setTokenInfo,
      currentStep,
      setCurrentStep,
      listAddress,
      setListAddress,
    }),
    [totalTransactions, tokenInfo, currentStep, listAddress, listAddressToSend, setListAddress],
  );

  useEffect(() => {
    if (!PERSIST_DATA_PAGES.includes(location.pathname)) {
      resetData();
      dispatch(setQueryParams({ step: STEPS_LINK[INITIAL_STEP] }));
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!address) {
      resetData();
    }
  }, [address]);

  return <SendTokenContext.Provider value={memoizedData}>{children}</SendTokenContext.Provider>;
};

export const useSendToken = () => {
  const context = useContext(SendTokenContext);

  if (!context) {
    throw new Error('useSendToken must be used within a SendTokenContextProvider');
  }

  return context;
};
