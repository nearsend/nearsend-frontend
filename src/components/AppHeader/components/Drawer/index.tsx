import { Drawer, Image } from 'antd';

import { DRAWER_WIDTH, NavigationProps } from 'components/AppHeader/contants';
import MenuOutline from 'resources/svg/MenuOutline';
import DrawerCloseIcon from 'resources/svg/DrawerCloseIcon';
import RightArrowIcon from 'resources/svg/RightArrowIcon';
import Logo from 'resources/images/logo.png';
import AppIcon from 'resources/svg/near_icon.svg';
import { useModal } from 'components/Modal/hooks';
import MobileConnectWalletButton from 'components/MobileConnectWalletButton';
import MobileSelectNetwork from '../MobileSelectNetwork';
import { useMemo, useState } from 'react';
import MobileListNetwork from '../MobileListNetwork';
import { useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import AppButton from 'components/AppButton';
import { useTranslation } from 'react-i18next';
import AddressCopy from 'components/AddressCopy';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTE_URLS } from 'constants/routes';
import { ChainFactory } from 'utils/chains/ChainFactory';
import useGoBackHomePage from 'hooks/layoutHook/useGoBackHomePage';
import { useWalletSelector } from 'context/NearWalletSelectorContext';

type DrawerProps = {
  currentPage: NavigationProps;
  connectedAddress: string | null | undefined;
  handleChangeNetwork: (chainId: string) => void;
};
const DrawerMenu: React.FC<DrawerProps> = ({ currentPage, connectedAddress, handleChangeNetwork, ...props }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [selectNetwork, setSelectNetwork] = useState(false);

  const { visible: visibleDrawer, onOpenModal: onOpenDrawer, onCloseModal: onCloseDrawer } = useModal();

  const { address, chainId } = useAppSelector(selectedAddress.getAddress);

  const { handleLogout } = useWalletSelector();
  const { handleGoBackHomePage } = useGoBackHomePage();

  const onLogout = () => {
    handleLogout(() => {
      navigate(
        {
          search: '',
        },
        {
          replace: true,
        },
      );
    });
    onCloseDrawer();
  };

  const handleSelectNetwork = () => setSelectNetwork((prev) => !prev);

  const addressDisplay = useMemo(() => {
    const chainUtils = new ChainFactory().getChain(chainId)?.getUtils();

    return chainUtils?.convertAddressToDisplayValue(address);
  }, [chainId, address]);

  const handleClickLogo = (e: any) => {
    handleGoBackHomePage(e, onCloseDrawer);
  };

  return (
    <div className="header_mobile">
      <MenuOutline onClick={onOpenDrawer} />
      <Drawer
        className="mobile-drawer"
        open={visibleDrawer}
        width={DRAWER_WIDTH}
        placement="right"
        onClose={onCloseDrawer}
        closeIcon={<DrawerCloseIcon />}
        {...props}
      >
        <div className="drawer__header">
          <div onClick={handleClickLogo}>
            <img width={150} src={Logo} alt="logo" />
          </div>
          <div onClick={onCloseDrawer}>
            <DrawerCloseIcon />
          </div>
        </div>
        <div className="drawer__content">
          <div>
            <Link to={ROUTE_URLS.TUTORIAL}>
              <div onClick={onCloseDrawer} className="drawer__content--tutorial">
                <h1>{t('header.tutorial')}</h1>
                <RightArrowIcon />
              </div>
            </Link>
            <div className="line" />
            {!!address && (
              <div className="drawer__content--address">
                <Image preview={false} src={AppIcon} alt="" />
                <AddressCopy addressToCopy={address} address={addressDisplay} viewAccount chainId={chainId} />
              </div>
            )}
            {selectNetwork && <MobileListNetwork handleChangeNetwork={handleChangeNetwork} />}
          </div>
          {!selectNetwork ? (
            <div className="drawer__content--button">
              <MobileSelectNetwork setSelectNetwork={setSelectNetwork} />
              {!address ? (
                <MobileConnectWalletButton onVisibleDrawer={onCloseDrawer} />
              ) : (
                <AppButton text={t('header.disconnect_wallet')} onClick={onLogout} />
              )}
            </div>
          ) : (
            <div onClick={handleSelectNetwork} className="drawer__content--back">
              <div>{t('common.back')}</div>
              <RightArrowIcon />
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default DrawerMenu;
