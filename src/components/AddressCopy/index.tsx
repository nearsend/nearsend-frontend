import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Tooltip, Space } from 'antd';

import IconCopy from 'resources/svg/IconCopy';
import IconChecked from 'resources/svg/IconChecked';
import { getBlockExplorerAccountLink, getBlockExplorerLink, getBlockExplorerName } from 'services/WalletService/utils';
import IconOpenInNew from 'resources/svg/IconOpenInNew';

const { Paragraph } = Typography;

type AddressCopyType = {
  address?: string;
  showBlockExplorerLink?: boolean;
  chainId?: number;
  txId?: string;
  addressToCopy: string;
  viewAccount?: boolean;
};

const AddressCopy: FC<AddressCopyType> = ({
  address,
  showBlockExplorerLink,
  chainId,
  txId,
  addressToCopy,
  viewAccount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="typography-wrapper">
      <Paragraph
        copyable={{
          text: addressToCopy,
          icon: [<IconCopy key="copy" />, <IconChecked key="checked" />],
          tooltips: (
            <Space size={8}>
              <IconCopy />
              {t('common.copy')}
            </Space>
          ),
        }}
      >
        {address || ''}{' '}
      </Paragraph>
      {viewAccount && chainId && address && (
        <Tooltip
          title={
            <Space size={8}>
              <IconOpenInNew />
              {t('common.view_on')}
            </Space>
          }
        >
          <a
            className="open-in-new"
            href={getBlockExplorerAccountLink(chainId, addressToCopy)}
            target="_blank"
            rel="noreferrer"
          >
            <IconOpenInNew />
          </a>
        </Tooltip>
      )}
      {showBlockExplorerLink && chainId && txId && (
        <Tooltip
          title={
            <Space size={8}>
              <IconOpenInNew />
              {t('common.view_on')}
            </Space>
          }
        >
          <a className="open-in-new" href={getBlockExplorerLink(chainId, txId)} target="_blank" rel="noreferrer">
            <IconOpenInNew />
          </a>
        </Tooltip>
      )}
    </div>
  );
};

export default AddressCopy;
