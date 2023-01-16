import { Col, Row, Tooltip, Typography } from 'antd';
import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
const { Text, Link } = Typography;

const TooltipsExample: FC<any> = () => {
  const { t } = useTranslation();

  return (
    <Tooltip
      overlayClassName="show-example"
      placement="bottomLeft"
      trigger={['hover']}
      title={
        <div>
          <Row justify="space-between" className={cx('show-example__title')}>
            <Col>
              <Text>{t('tooltip.title')}</Text>
            </Col>
          </Row>
          <div className={cx('show-example__format')}>
            {t('tooltip.format')} <span className={cx('show-example__format--red')}>{t('tooltip.address')}</span>,{' '}
            <span className={cx('show-example__format--blue')}>{t('tooltip.amount')}</span>
          </div>
          <div className={cx('show-example__example')}>
            <Text>testaddress01.near,0.001</Text>
            <Text>testaddress02.near,1</Text>
            <Text>testaddress03.near,3.45</Text>
            <Text>testaddress04.near,2.1</Text>
            <Text>testaddress05.near,1.5</Text>
          </div>
          <Text className={cx('show-example__instruction')}>{t('tooltip.instruction')}</Text>
        </div>
      }
    >
      <Link>{t('prepare.show_example')}</Link>
    </Tooltip>
  );
};

export default TooltipsExample;
