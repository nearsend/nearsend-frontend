import { Col, Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Paragraph, Title } = Typography;

const BlockMultiTabs = () => {
  const { t } = useTranslation();

  return (
    <section id="home" className="block-multi-tabs">
      <div className="container">
        <Row gutter={[29, 29]}>
          <Col xs={24} sm={12}>
            <Title level={1}>{t('block_multiple_tabs.title')}</Title>
            <Paragraph>{t('block_multiple_tabs.content')}</Paragraph>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default BlockMultiTabs;
