/// <reference types="vite/client" />

interface ImportMetaEnv {
  //API endpoint of Nearsend Application
  readonly VITE_API_URL: string;
  //Contract address of Nearsend Contract on NEAR Testnet
  readonly VITE_CONTRACT_ID_TESTNET: string;
  //Contract address of Nearsend Contract on NEAR Mainnet
  readonly VITE_CONTRACT_ID_MAINNET: string;
  //API endpoint to get list all tokens belong to current user on NEAR Testnet
  readonly VITE_NEAR_WALLET_URL_TESTNET: string;
  //API endpoint to get list all tokens belong to current user on NEAR Mainnet
  readonly VITE_NEAR_WALLET_URL_MAINNET: string;
  //NEAR RPC endpoint on NEAR Testnet to get old data on NEAR Blockchain
  readonly VITE_ARCHIVAL_NETWORK_URL_RPC_TESTNET: string;
  //NEAR RPC endpoint on NEAR Mainnet to get old data on NEAR Blockchain
  readonly VITE_ARCHIVAL_NETWORK_URL_RPC_MAINNET: string;
  //GraphQL endpoint of Nearblocks.io Testnet
  readonly VITE_NEARBLOCKS_GRAPHQL_URL_TESTNET: string;
  //GraphQL endpoint of Nearblocks.io Mainnet
  readonly VITE_NEARBLOCKS_GRAPHQL_URL_MAINNET: string;
  //Coin Gecko API to get Near exchange rate
  readonly VITE_COIN_GECKO_API: string;
  //Service fee USD rate per account (rate is based on 1 USD for example 0.1 = 10 cents)
  readonly VITE_SERVICE_FEE_USD_PER_ACCOUNT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}