import { FC, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Image } from 'antd';

import ConnectWalletButton from '../ConnectWalletButton';
import Profile from './components/Profile';
import Navigation from './components/Navigation';
import { DEFAULT_NAVIGATION, NAVIGATION } from './contants';
import DrawerMenu from './components/Drawer';
import SelectNetwork from './components/SelectNetwork';
import Logo from 'resources/images/logo.png';
import useGoBackHomePage from 'hooks/layoutHook/useGoBackHomePage';
import { useWalletSelector } from 'context/NearWalletSelectorContext';
import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import { setAppChainId } from 'store/address/slice';
import selectedAddress from 'store/address/selector';

type HeaderProps = Record<string, never>;

const Header: FC<HeaderProps> = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const chainIdRef = useRef('');

  const dispatch = useAppDispatch();

  const { accountId, handleLogout } = useWalletSelector();
  const { handleGoBackHomePage } = useGoBackHomePage();

  const { chainId } = useAppSelector(selectedAddress.getAddress);

  const currentPage = useMemo(() => {
    return NAVIGATION.reduce((cur, acc) => {
      const { children = [], link } = acc || {};

      if (children?.length > 0) {
        const currentSelectedChild = children.find(({ link }: any) => location.pathname === link);
        return currentSelectedChild && currentSelectedChild?.key ? { cur, ...currentSelectedChild } : { ...cur };
      } else {
        return location.pathname === link ? { cur, ...acc } : { ...cur };
      }
    }, DEFAULT_NAVIGATION);
  }, [location]);

  const handleChangeNetwork = (value: string) => {
    if (accountId) {
      handleLogout(() => {
        dispatch(setAppChainId(value));
        chainIdRef.current = value.toString();
      });
    } else {
      dispatch(setAppChainId(value));
      chainIdRef.current = value.toString();
    }
  };

  useEffect(() => {
    // Refresh page after chain network success
    if (chainId === chainIdRef.current) {
      setTimeout(() => {
        navigate(0);
      }, 300);
    }
  }, [chainId]);

  return (
    <header id="header">
      <div className="container">
        <div className="logo" onClick={handleGoBackHomePage}>
          <Image className="logo" preview={false} alt="" src={Logo} />
        </div>

        <Navigation navigation={NAVIGATION} mode="horizontal" currentPage={currentPage} />

        <div className="header_mobile_wrapper">
          <DrawerMenu
            currentPage={currentPage}
            connectedAddress={accountId}
            handleChangeNetwork={handleChangeNetwork}
          />
        </div>

        <div className="header_desktop">
          <SelectNetwork handleChangeNetwork={handleChangeNetwork} />
          {accountId ? <Profile /> : <ConnectWalletButton />}
        </div>
      </div>
    </header>
  );
};

export default Header;
