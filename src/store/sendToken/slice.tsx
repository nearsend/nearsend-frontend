import { createSlice } from '@reduxjs/toolkit';

export interface State {
  tokenInfo: any;
  transactionHashes: string[];
  errorsMsg: any;
}

const initialState: State = {
  tokenInfo: null,
  transactionHashes: [],
  errorsMsg: '',
};

export const SendTokenSlice = createSlice({
  name: 'send-token',
  initialState,
  reducers: {
    setSendTokenInfo: (state: State, action: any) => {
      return {
        ...state,
        tokenInfo: action.payload,
      };
    },
    setTransactionHashes: (state: State, action: any) => {
      return {
        ...state,
        transactionHashes: action.payload,
      };
    },
    setErrorMessage: (state: State, action: any) => {
      return {
        ...state,
        errorMessage: action.payload,
      };
    },
  },
});

export const { setSendTokenInfo, setTransactionHashes, setErrorMessage } = SendTokenSlice.actions;

export const namespace = 'SendTokenSlice';

export default SendTokenSlice.reducer;
