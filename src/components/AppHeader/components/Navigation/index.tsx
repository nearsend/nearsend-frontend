import { FC } from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { MenuMode } from 'antd/lib/menu';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';

import { isExternalLink } from 'utils';
import { NavigationProps } from 'components/AppHeader/contants';

type NavigationComponentProps = {
  navigation: NavigationProps[];
  mode: MenuMode | undefined;
  currentPage?: any;
  onClose?: () => void;
};

const Navigation: FC<NavigationComponentProps> = ({ navigation, mode, currentPage, onClose }) => {
  const { t } = useTranslation();

  const handleClickLink = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const renderLink = (item: any) => {
    const { key, link, text } = item;

    return (
      <>
        {isExternalLink(link) ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            onClick={handleClickLink}
            className={cx({
              active: currentPage?.key === key,
            })}
          >
            {t(text)}
          </a>
        ) : (
          <Link
            to={link}
            onClick={handleClickLink}
            className={cx({
              active: currentPage?.key === key,
            })}
          >
            {t(text)}
          </Link>
        )}
      </>
    );
  };

  const navigationItems = (navigation || []).map((item) => ({
    key: item?.key,
    label: renderLink(item),
  }));

  return <Menu mode={mode as any} overflowedIndicator={false} selectedKeys={['']} items={navigationItems} />;
};

export default Navigation;
