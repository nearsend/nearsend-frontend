import { FC, MouseEventHandler, ReactNode } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

import LoadingComponent from 'components/Loading';

declare const ButtonVariants: ['default', 'primary', 'secondary', 'tertiary', 'connect', 'wallet', 'forth'];
export declare type ButtonVariant = typeof ButtonVariants[number];

type AppButtonProps = {
  variant?: ButtonVariant;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  text?: ReactNode;
  disabled?: boolean;
  htmlType?: string | any;
  loading?: boolean;
  href?: string;
  children?: ReactNode;
};

const AppButton: FC<AppButtonProps> = ({
  variant = 'default',
  prefixIcon,
  suffixIcon,
  text,
  className,
  loading = false,
  children,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <Button
      className={classNames('button', `button--${variant}`, { className: !!className })}
      loading={loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingComponent size={18} spinning={true} /> {t('button.process')}
        </>
      ) : (
        <>
          {prefixIcon && <span className="prefix">{prefixIcon}</span>}
          {text ? <span>{text}</span> : children}
          {suffixIcon && <span className="suffix">{suffixIcon}</span>}
        </>
      )}
    </Button>
  );
};

export default AppButton;
