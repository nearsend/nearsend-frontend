import { Col, Row } from 'antd';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

type ProgressProps = {
  total: number;
  current: number;
};

const Progress: FC<ProgressProps> = ({ total, current }) => {
  const { t } = useTranslation();
  return (
    <Row className="progress__wrapper">
      <Row className="progress__info">
        <Col>{t('progress.check')}</Col>
        <Col className="progress__info--bold">
          {current}/{total}
        </Col>
      </Row>
      <Row className="progress__bar">
        <div className="progress__bar--full"></div>
        <div className="progress__bar--current" style={{ width: `calc(${current / total} * 100%)` }}></div>
      </Row>
    </Row>
  );
};

export default Progress;
