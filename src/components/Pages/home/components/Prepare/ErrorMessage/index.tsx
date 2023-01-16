import { WarningOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';

const ErrorMessage = ({ error, action }: { error: string; action?: any }) => {
  return (
    <Row className="error-message__wrapper">
      <Col className="error-message__content">
        <WarningOutlined />
        {error}
      </Col>
      {action && <Col className="error-message__action">{action}</Col>}
    </Row>
  );
};

export default ErrorMessage;
