import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import App from './App';
import { persistor, store } from 'store/configStore';
import AppConnectWalletWrapper from 'components/AppConnectWalletWrapper';
import reportWebVitals from './reportWebVital';
import { WalletSelectorContextProvider } from 'context/NearWalletSelectorContext';

import '@near-wallet-selector/modal-ui/styles.css';
import 'antd/dist/antd.css';
import './styles/_app.scss';

const client = new ApolloClient({
  uri: `${import.meta.env.VITE_NEARBLOCKS_GRAPHQL_URL_TESTNET}/graphql`,
  cache: new InMemoryCache(),
});

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {/* <ApolloProvider client={client}> */}
      <WalletSelectorContextProvider>
        <AppConnectWalletWrapper>
          <App />
        </AppConnectWalletWrapper>
      </WalletSelectorContextProvider>
      {/* </ApolloProvider> */}
    </PersistGate>
  </Provider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
