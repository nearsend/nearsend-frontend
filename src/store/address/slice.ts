import { createSlice } from '@reduxjs/toolkit';
import { CHAIN_ID } from 'connectors/constants';
import { ChainFactory } from 'utils/chains/ChainFactory';

export interface Address {
  address: string;
  chainId: string | null;
  tokenInfo: any;
  network: string | undefined;
}

const initialState: Address = {
  address: '',
  chainId: import.meta.env.DEV ? CHAIN_ID.NEAR_TEST : CHAIN_ID.NEAR,
  tokenInfo: null,
  network: undefined,
};

export const AddressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    loginStart: (state: Address, action: any) => {
      const { address } = action.payload;
      return {
        ...state,
        address,
      };
    },
    setAppNetwork: (state: Address, action: any) => ({
      ...state,
      network: action.payload,
    }),
    setAppChainId: (state: Address, action: any) => {
      const networkType = new ChainFactory().getChain(action.payload?.toString())?.getNetworkType();

      return {
        ...state,
        chainId: action.payload?.toString(),
        network: networkType,
      };
    },
    setAppAddress: (state: Address, action: any) => ({
      ...state,
      address: action.payload,
    }),
    setAppToken: (state: Address, action: any) => ({
      ...state,
      tokenInfo: action.payload,
    }),
    logout: (state: Address) => ({
      ...state,
    }),
    logoutSuccess: (state: Address) => ({
      ...state,
      address: '',
    }),
  },
});

export const { loginStart, logout, logoutSuccess, setAppToken, setAppChainId, setAppAddress, setAppNetwork } =
  AddressSlice.actions;

export const namespace = 'AddressSlice';

export default AddressSlice.reducer;
