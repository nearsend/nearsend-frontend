import { INITIAL_STEP } from './../../context/SendTokenContext';
import { STEPS_LINK } from 'pages/home';
import { useEffect, useState } from 'react';

import { useAppSelector } from 'hooks/useStore';
import { useAppDispatch } from './../useStore';
import { setTransactionHashes, setErrorMessage } from 'store/sendToken/slice';
import navigationService from 'services/navigationService';
import selectGlobalState from 'store/global/selector';
import { setQueryParams } from 'store/global/slice';

const useNearWalletQueryParams = () => {
  const dispatch = useAppDispatch();

  const [hasInit, setHasInit] = useState(false);

  const queryParams = useAppSelector(selectGlobalState.getQueryParams);

  useEffect(() => {
    if (hasInit) {
      return;
    }

    const removeTransactionHashes = async () => {
      const { step, transactionHashes, errorCode } = queryParams || {};
      const navigate = navigationService?.navigation;

      if (errorCode === 'userRejected') {
        dispatch(setErrorMessage('message.E12'));
      } else {
        dispatch(setErrorMessage(''));
      }

      transactionHashes && dispatch(setTransactionHashes(transactionHashes.split(',')));

      navigate(
        {
          search: `?step=${step}`,
        },
        {
          replace: true,
        },
      );
    };

    const redirectToPrepareStep = () => {
      const navigate = navigationService?.navigation;

      navigate({
        search: `?step=${STEPS_LINK[INITIAL_STEP]}`,
      });

      dispatch(setQueryParams({ step: STEPS_LINK[INITIAL_STEP] }));
    };

    if (queryParams?.transactionHashes || queryParams?.errorCode) {
      removeTransactionHashes();
      setHasInit(true);
    } else if (queryParams?.step && queryParams?.step !== STEPS_LINK[INITIAL_STEP]) {
      redirectToPrepareStep();
      setHasInit(true);
    }
  }, [queryParams]);
};

export default useNearWalletQueryParams;
