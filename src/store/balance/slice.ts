import { createSlice } from '@reduxjs/toolkit';

export interface State {
  balance: any;
}

const initialState: State = {
  balance: {},
};

export const BalanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    setBalance: (state: State, action: any) => {
      const { chainId, token, amount } = action.payload || {};

      return {
        ...state,
        balance: {
          ...state.balance,
          [chainId]: {
            ...state.balance[chainId],
            [token]: amount,
          },
        },
      };
    },
    clearBalance: (state: State) => {
      return {
        ...state,
        balance: {},
      };
    },
  },
});

export const { setBalance, clearBalance } = BalanceSlice.actions;

export const namespace = 'BalanceSlice';

export default BalanceSlice.reducer;
