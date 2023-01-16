import { Col, Row, Tooltip, Typography } from 'antd';
import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const { Text, Link } = Typography;

import { CHAIN_ID } from 'connectors/constants';
import IconXLS from 'resources/svg/IconXLS';
import IconCSV from 'resources/svg/IconCSV';
import IconTXT from 'resources/svg/IconTXT';

const filesPathNearMainet = [
  { path: 'example.near.xls', showName: 'example.xls', icon: <IconXLS /> },
  { path: 'example.near.csv', showName: 'example.csv', icon: <IconCSV /> },
  { path: 'example.near.txt', showName: 'example.txt', icon: <IconTXT /> },
];

const filesPathNearTestnet = [
  { path: 'example.testnet.xls', showName: 'example.xls', icon: <IconXLS /> },
  { path: 'example.testnet.csv', showName: 'example.csv', icon: <IconCSV /> },
  { path: 'example.testnet.txt', showName: 'example.txt', icon: <IconTXT /> },
];

const TooltipsExampleFile: FC<{ chainId: string }> = ({ chainId }) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      overlayClassName="show-example-file"
      placement="bottomLeft"
      trigger={['hover']}
      title={
        <div>
          <Row justify="space-between" className={cx('show-example-file__title')}>
            <Col>
              <Text>{t('tooltip.title_example_file')}</Text>
            </Col>
          </Row>
          <div className={cx('show-example-file__example')}>
            {(chainId === CHAIN_ID.NEAR_TEST ? filesPathNearTestnet : filesPathNearMainet).map((path, index) => (
              <Link key={index} href={path.path} download>
                {path.icon}
                {path.showName}
              </Link>
            ))}
          </div>
        </div>
      }
    >
      <Link>{t('prepare.example_file')}</Link>
    </Tooltip>
  );
};

export default TooltipsExampleFile;
