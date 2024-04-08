import { FC } from 'react';
import { Col, Image, Row, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import Landing from 'resources/images/landing.png';
import IconArrowRight from 'resources/svg/IconArrowRight';
import ConnectWalletButton from 'components/ConnectWalletButton';
import { ROUTE_URLS } from 'constants/routes';
import Logo from 'resources/svg/Logo';
import InvokerLab from 'resources/svg/InvokerLab';

const { Title, Paragraph } = Typography;

const LandingSection: FC<{ isConnecting: boolean; isMinimize: boolean }> = ({ isConnecting, isMinimize }) => {
  const { t } = useTranslation();

  return (
    <section
      id="landing"
      className={cx('landing', {
        connected: isConnecting,
        minimized: isMinimize,
      })}
    >
      <div className="landing-container">
        <Row gutter={[29, 29]} align="middle">
          <Col md={14} xs={24}>
            <Title level={1}>{t('home.title')}</Title>
            <Paragraph>{t('home.cta')}</Paragraph>
            <div className="powered-by">
              {t('common.powered_by')}{' '}
              <a href="https://near.org/" target="_blank" rel="noreferrer">
                <Logo />
              </a>{' '}
            </div>

            {!isConnecting && (
              <div className="landing__connect">
                <div>
                  <span className="linear">{t('home.connect')}</span>
                  <span>{t('home.to_start')}</span>
                </div>
                <Space size={54}>
                  <ConnectWalletButton />
                  <Link to={ROUTE_URLS.TUTORIAL}>
                    {t('home.view_tutorial')}
                    <IconArrowRight />
                  </Link>
                </Space>
              </div>
            )}
          </Col>
          <Col md={10} xs={24} />
        </Row>
      </div>
    </section>
  );
};

export default LandingSection;
