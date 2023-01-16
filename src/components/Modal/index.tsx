import { Fragment, FC, ReactNode } from 'react';
import { Modal, Typography } from 'antd';
import IconClose from 'resources/svg/IconClose';

const { Title } = Typography;

const ModalComponent: FC<{
  title?: any;
  onClose?: any;
  showCloseIcon?: boolean;
  open: boolean;
  width?: number | string;
  maskClosable?: boolean;
  wrapClassName?: string;
  getContainer?: any;
  destroyOnClose?: boolean;
  closable?: boolean;
  children: ReactNode;
}> = ({ children, title, onClose, showCloseIcon = true, width, destroyOnClose = true, maskClosable, ...props }) => {
  return (
    <Modal
      footer={null}
      wrapClassName={'modal'}
      width={width ?? 550}
      destroyOnClose={destroyOnClose}
      onCancel={onClose}
      maskClosable={showCloseIcon}
      closeIcon={<IconClose />}
      {...props}
    >
      <Fragment>
        <div className="modal-wrap">
          {title && (
            <Title level={5} className="title">
              {title}
            </Title>
          )}
          {children}
        </div>
      </Fragment>
    </Modal>
  );
};

export default ModalComponent;
