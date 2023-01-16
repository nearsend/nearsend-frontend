import { Fragment, Suspense, useEffect, useState } from 'react';
import { useTranslation, withTranslation } from 'react-i18next';
import { ConfigProvider } from 'antd';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import { Locale } from 'antd/lib/locale-provider';

import 'language/i18n';
import routes, { ROUTE_URLS } from 'constants/routes';
import Header from 'components/AppHeader';
import Footer from 'components/AppFooter';
import ProtectedRoute from 'components/Layout/ProtedtedRoute';
import { LANGUAGE } from 'constants/index';
import enUS from 'antd/lib/locale/en_US';
import { useLanguage } from 'hooks/layoutHook/useLanguage';
import LoadingComponent from 'components/Loading';
import { useAppSelector } from 'hooks/useStore';
import selectGlobalState from 'store/global/selector';
import { SendTokenContextProvider } from 'context/SendTokenContext';
import useDetectMultiTabs from 'hooks/layoutHook/useDetectMultiTabs';

const App = () => {
  const { i18n } = useTranslation();

  const [locale, setLocale] = useState<Locale | undefined>(undefined);

  const loading = useAppSelector(selectGlobalState.getAppLoading);

  useDetectMultiTabs();
  useLanguage();

  const renderRoute = (route: any) => {
    const Component = route?.component || Fragment;
    const Layout = route?.layout || Fragment;

    return (
      <Route
        path={route.path}
        key={route.path}
        index={!!route?.index}
        element={
          <Layout>
            {route?.isPrivate ? (
              <ProtectedRoute key={route.path}>
                <Component />
              </ProtectedRoute>
            ) : (
              <Component />
            )}
          </Layout>
        }
      />
    );
  };

  useEffect(() => {
    switch (i18n.language) {
      case LANGUAGE.EN: {
        setLocale(enUS);
        break;
      }
      default: {
        setLocale(enUS);
        break;
      }
    }
  }, [i18n.language]);

  return (
    <LoadingComponent spinning={loading}>
      <ConfigProvider locale={locale}>
        <Router>
          <div className="layer">
            <div />
            <div />
            <div />
          </div>
          <Suspense fallback={<LoadingComponent spinning={true} />}>
            <SendTokenContextProvider>
              <Header />
              <Routes>
                {routes.map((route) => renderRoute(route))}
                <Route path="*" element={<Navigate to={ROUTE_URLS.HOME} />} />
              </Routes>
            </SendTokenContextProvider>
          </Suspense>
          <Footer />
        </Router>
      </ConfigProvider>
    </LoadingComponent>
  );
};

export default withTranslation()(App);
