import { ROUTE_URLS, PAGE_KEYS } from './../../../constants/routes';

export type NavigationProps = {
  key: string;
  text: string;
  link: string;
  children: NavigationProps[];
};

export const NAVIGATION: NavigationProps[] = [
  {
    key: PAGE_KEYS.TUTORIAL,
    text: 'header.tutorial',
    link: ROUTE_URLS.TUTORIAL,
    children: [],
  },
];

export const DEFAULT_NAVIGATION = {
  key: '',
  text: '',
  link: '',
  children: [],
};

export const DRAWER_WIDTH = 375;
