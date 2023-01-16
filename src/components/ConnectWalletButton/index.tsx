import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import AppButton, { ButtonVariant } from '../AppButton';
import { useWalletSelector } from 'context/NearWalletSelectorContext';

const ConnectWalletButton: FC<{ variant?: ButtonVariant; text?: string; showIcon?: boolean }> = ({
  variant = 'default',
  text = 'common.connect_wallet',
}) => {
  const { t } = useTranslation();

  const { modal } = useWalletSelector();

  const connectWallet = () => {
    modal?.show();
  };

  return <AppButton variant={variant} text={t(text)} onClick={connectWallet} />;
};

export default ConnectWalletButton;
