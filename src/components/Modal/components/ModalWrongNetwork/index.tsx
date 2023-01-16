import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';

import selectedConnection from 'store/connection/selector';
import { SUPPORTED_NETWORK, WALLET_NAME } from 'connectors/constants';
import { useAppSelector } from 'hooks/useStore';
import IconWrongNetwork from 'resources/svg/IconWrongNetwork';
import selectedAddress from 'store/address/selector';
import { convertToListNetworkName } from 'utils';
import Modal from 'components/Modal';

const { Paragraph, Title } = Typography;

type ModalWrongNetworkProps = {};

const ModalWrongNetwork: FC<ModalWrongNetworkProps> = () => {
  const { t } = useTranslation();

  const { isWrongNetwork } = useAppSelector(selectedConnection.getConnection);
  const connectedWalletType = useAppSelector(selectedConnection.getConnectedWalletType);
  const { network, chainId } = useAppSelector(selectedAddress.getAddress);

  const networkToSwapTo = useMemo(() => {
    switch (network) {
      case SUPPORTED_NETWORK.NEAR: {
        return convertToListNetworkName([chainId], ` ${t('common.or')} `);
      }

      default: {
        return '';
      }
    }
  }, [t, network, chainId]);

  return (
    <Modal open={isWrongNetwork} showCloseIcon={false} closable={false} destroyOnClose>
      <IconWrongNetwork />
      <Title level={5} className="title">
        {t('common.network_notice_title')}
      </Title>
      <Paragraph>
        {t('common.network_notice_desc', {
          network: networkToSwapTo,
          wallet: t(WALLET_NAME[connectedWalletType?.[network]]),
        })}
      </Paragraph>
    </Modal>
  );
};

export default ModalWrongNetwork;
