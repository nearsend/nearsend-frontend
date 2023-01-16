import { createSlice } from '@reduxjs/toolkit';

export interface Connection {
  isConnectingWallet: boolean;
  isWrongNetwork: boolean;
  connectedWalletType: any;
}

const initialState: Connection = {
  isConnectingWallet: false,
  isWrongNetwork: false,
  connectedWalletType: '',
};

export const ConnectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    handleSetLoadingMetamask: (state: Connection, action: any) => {
      return {
        ...state,
        isConnectingWallet: action.payload,
      };
    },
    handleSetWrongNetwork: (state: Connection, action: any) => {
      return {
        ...state,
        isWrongNetwork: action.payload,
      };
    },
    handleSetConnectedWalletType: (state: Connection, action: any) => {
      return {
        ...state,
        connectedWalletType: {
          ...state.connectedWalletType,
          ...action.payload,
        },
      };
    },
    handleClearConnectedWalletType: (state: Connection) => {
      return {
        ...state,
        connectedWalletType: {},
      };
    },
  },
});

export const {
  handleSetWrongNetwork,
  handleSetLoadingMetamask,
  handleSetConnectedWalletType,
  handleClearConnectedWalletType,
} = ConnectionSlice.actions;

export const namespace = 'ConnectionSlice';

export default ConnectionSlice.reducer;
