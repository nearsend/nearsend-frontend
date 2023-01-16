import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTE_URLS } from 'constants/routes';
import { INITIAL_STEP, useSendToken } from 'context/SendTokenContext';
import { useAppSelector } from 'hooks/useStore';
import { STEPS_LINK } from 'pages/home';
import selectedAddress from 'store/address/selector';
import selectGlobalState from 'store/global/selector';

const useGoBackHomePage = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  const { address } = useAppSelector(selectedAddress.getAddress);
  const hasReport = useAppSelector(selectGlobalState.getIsCurrentScreenHasReport);

  const { setCurrentStep } = useSendToken();

  const handleGoBackHomePage = (event: any, fn?: () => void): void => {
    if (!address || location?.pathname !== ROUTE_URLS.HOME) {
      navigate(ROUTE_URLS.HOME);
    } else {
      if (hasReport) {
        const promtGoBack = confirm(t('send_token.confirm_go_back'));

        if (!promtGoBack) {
          return;
        }
      }

      navigate(
        {
          search: `?step=${STEPS_LINK[INITIAL_STEP]}`,
        },
        {
          state: {
            resetState: !!hasReport,
          },
        },
      );
      setCurrentStep(INITIAL_STEP);

      if (typeof fn === 'function') {
        fn();
      }
    }
  };

  return {
    handleGoBackHomePage,
  };
};

export default useGoBackHomePage;
