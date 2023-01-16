import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import AppButton, { ButtonVariant } from '../AppButton';
import { useWalletSelector } from 'context/NearWalletSelectorContext';

const MobileConnectWalletButton: FC<{
  variant?: ButtonVariant;
  text?: string;
  showIcon?: boolean;
  onVisibleDrawer?: Function;
}> = ({ variant = 'default', text = 'common.connect_wallet', onVisibleDrawer = () => {} }) => {
  const { t } = useTranslation();

  const { modal } = useWalletSelector();

  const connectWallet = () => {
    onVisibleDrawer();
    modal?.show();
  };

  return <AppButton variant={variant} text={t(text)} onClick={connectWallet} />;
};

export default MobileConnectWalletButton;
