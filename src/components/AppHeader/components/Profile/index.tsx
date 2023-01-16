import { FC, useMemo } from 'react';
import { Dropdown, Menu, Typography, Image, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import selectedAddress from 'store/address/selector';
import { useAppSelector } from 'hooks/useStore';
import AddressCopy from 'components/AddressCopy';
import { ChainFactory } from 'utils/chains/ChainFactory';
import AppButton from 'components/AppButton';
import AppIcon from 'resources/svg/near_icon.svg';
import IconClose from 'resources/svg/IconClose';
import { useNavigate } from 'react-router-dom';

import { useWalletSelector } from 'context/NearWalletSelectorContext';
const { Paragraph } = Typography;

type ProfileProps = {
  onClose?: () => void;
};

const Profile: FC<ProfileProps> = ({ onClose }) => {
  const { t } = useTranslation();

  const { address, chainId } = useAppSelector(selectedAddress.getAddress);

  const { handleLogout, modal } = useWalletSelector();

  const navigate = useNavigate();

  const addressDisplay = useMemo(() => {
    const chainUtils = new ChainFactory().getChain(chainId)?.getUtils();

    return chainUtils?.convertAddressToDisplayValue(address);
  }, [chainId, address]);

  const menu = useMemo(() => {
    const handleOnClose = () => {
      onClose && onClose();
    };

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
      handleOnClose();
    };

    const onSwitchWallet = () => {
      modal?.show();
    };

    const PROFILE_ITEMS = [
      {
        key: 0,
        label: (
          <div className="profile__connect">
            <Paragraph>{t('common.connected_wallet')}</Paragraph>
            <span onClick={handleOnClose}>
              <IconClose />
            </span>
          </div>
        ),
      },
      {
        key: 1,
        label: (
          <div className="profile__address" onClick={(e) => e.stopPropagation()}>
            <Image preview={false} src={AppIcon} alt="" />
            <AddressCopy addressToCopy={address} address={addressDisplay} viewAccount chainId={chainId} />
          </div>
        ),
      },
      {
        key: 2,
        label: <AppButton variant="secondary" text={t('header.switch_wallet')} onClick={onSwitchWallet} />,
      },
      {
        key: 3,
        label: <AppButton text={t('header.disconnect')} onClick={onLogout} />,
      },
    ];

    return <Menu className="profile__dropdown" mode="vertical" items={PROFILE_ITEMS} />;
  }, [address]);

  return (
    <>
      <Dropdown
        overlay={menu}
        trigger={['click']}
        placement="bottomRight"
        getPopupContainer={(trigger: any): any => trigger.parentElement}
      >
        <AppButton className="profile" text={<Tooltip title={address}>{addressDisplay}</Tooltip>} />
      </Dropdown>

      <div className="profile_mobile">{menu}</div>
    </>
  );
};

export default Profile;
