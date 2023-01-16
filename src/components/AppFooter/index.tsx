import { FC } from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { getBlockExplorerAccountLink } from 'services/WalletService/utils';
import { useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import { CONTRACT_ID } from 'connectors/constants';

type FooterProps = Record<string, never>;

const { Paragraph } = Typography;

const Footer: FC<FooterProps> = ({}) => {
  const { t } = useTranslation();

  const { chainId } = useAppSelector(selectedAddress.getAddress);

  return (
    <footer id="footer">
      <div className="container">
        <Paragraph>
          {t('footer.title')}{' '}
          <a href={getBlockExplorerAccountLink(chainId, CONTRACT_ID[chainId])} target="_blank" rel="noreferrer">
            {CONTRACT_ID[chainId]}
          </a>
        </Paragraph>

        {(process.env.COMMIT_HASH || process.env.VITE_VERCEL_GIT_COMMIT_SHA) && (
          <Paragraph>
            {t('footer.commit_version', {
              commit_hash: process.env.COMMIT_HASH || process.env.VITE_VERCEL_GIT_COMMIT_SHA || '',
            })}
          </Paragraph>
        )}
      </div>
    </footer>
  );
};

export default Footer;
