import { FC } from 'react';

import useSetQueryParams from 'hooks/blockchainHook/useSetQueryParams';

const Layout: FC<any> = ({ children }) => {
  useSetQueryParams();

  return <div id="main-body">{children}</div>;
};

export default Layout;
