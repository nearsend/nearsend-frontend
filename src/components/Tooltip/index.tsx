import { FC, ReactNode } from 'react';
import { Tooltip } from 'antd';

const TooltipComponent: FC<{ title: ReactNode; [x: string]: any }> = ({ title, children, ...props }) => {
  return (
    <Tooltip trigger={['hover']} overlayClassName="tooltip-status" placement="rightTop" title={title}>
      <span {...props}>{children}</span>
    </Tooltip>
  );
};

export default TooltipComponent;
