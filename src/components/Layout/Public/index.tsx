import { FC, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppSelector } from 'hooks/useStore';
import selectGlobalState from 'store/global/selector';
import { ROUTE_URLS } from 'constants/routes';
import { useWalletSelector } from 'context/NearWalletSelectorContext';
import useSetQueryParams from 'hooks/blockchainHook/useSetQueryParams';
import selectedAddress from 'store/address/selector';

const Layout: FC<any> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useSetQueryParams();

  const { address } = useAppSelector(selectedAddress.getAddress);
  const isOpeningMultipleTabs = useAppSelector(selectGlobalState.getIsOpeningMultipleTabs);

  useEffect(() => {
    if (isOpeningMultipleTabs && location.pathname !== ROUTE_URLS.MULTIPLE_TABS) {
      navigate(ROUTE_URLS.MULTIPLE_TABS);
    }
  }, [isOpeningMultipleTabs, location.pathname]);

  useEffect(() => {
    if (!address) {
      navigate(ROUTE_URLS.HOME);
    }
  }, [address]);

  return <div id="main-body">{children}</div>;
};

export default Layout;
