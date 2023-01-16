import { Spin, Image } from 'antd';
import { FC, ReactNode } from 'react';
import Icon from '@ant-design/icons';

import IconSpin from 'resources/images/loading.png';

export const DEFAULT_SIZE = 32;

const LoadingComponent: FC<{ children?: ReactNode; spinning: boolean; size?: number; icon?: any }> = ({
  children,
  spinning,
  size = DEFAULT_SIZE,
  icon,
}) => {
  // const antIcon = (
  //   <Icon
  //     component={() => <Image width={40} height={40} preview={false} src={IconSpin} alt="" />}
  //     className="anticon-spin"
  //   />
  // );

  const spinner = (
    <div
      className="spinner"
      style={{
        transform: `scale(${size / DEFAULT_SIZE})`,
      }}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
  return (
    <Spin spinning={spinning} indicator={icon || spinner}>
      {children}
    </Spin>
  );
};

export default LoadingComponent;
