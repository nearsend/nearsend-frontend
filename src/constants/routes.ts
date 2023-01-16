import Home from 'pages/home';
import BlockMultiTabs from 'pages/block-multi-tabs';
import TutorialPage from 'pages/tutorial';

import PublicLayout from 'components/Layout/Public';

export const ROUTE_URLS = {
  HOME: '/',
  TUTORIAL: '/tutorial',
  MULTIPLE_TABS: '/block-multi-tabs',
};

export enum PAGE_KEYS {
  HOME = 'HOME',
  TUTORIAL = 'TUTORIAL',
  MULTIPLE_TABS = 'MULTIPLE_TABS',
}

export const PERSIST_DATA_PAGES = [ROUTE_URLS.HOME];

const routes = [
  {
    name: PAGE_KEYS.HOME,
    path: ROUTE_URLS.HOME,
    component: Home,
    layout: PublicLayout,
    isPrivate: false,
    index: true,
  },
  {
    name: PAGE_KEYS.MULTIPLE_TABS,
    path: ROUTE_URLS.MULTIPLE_TABS,
    component: BlockMultiTabs,
    layout: PublicLayout,
    isPrivate: false,
    index: true,
  },
  {
    name: PAGE_KEYS.TUTORIAL,
    path: ROUTE_URLS.TUTORIAL,
    component: TutorialPage,
    layout: PublicLayout,
    isPrivate: false,
    index: true,
  },
];
export default routes;
