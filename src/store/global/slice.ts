import { createSlice } from '@reduxjs/toolkit';

export interface State {
  appLoading: boolean;
  loadingTransactions: boolean;
  isOpeningMultipleTabs: boolean;
  hasReport: boolean;
  queryParams: any;
}

const initialState: State = {
  appLoading: false,
  loadingTransactions: false,
  isOpeningMultipleTabs: false,
  hasReport: false,
  queryParams: null,
};

export const GlobalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setAppLoading: (state: State, action: any) => {
      return {
        ...state,
        appLoading: action.payload,
      };
    },
    setLoadingTransactions: (state: State, action: any) => {
      return {
        ...state,
        loadingTransactions: action.payload,
      };
    },
    setIsOpeningMultipleTabs: (state: State, action: any) => {
      return {
        ...state,
        isOpeningMultipleTabs: action.payload,
      };
    },
    setHasReport: (state: State, action: any) => {
      return {
        ...state,
        hasReport: action.payload,
      };
    },
    setQueryParams: (state: State, action: any) => {
      return {
        ...state,
        queryParams: action.payload,
      };
    },
  },
});

export const { setAppLoading, setLoadingTransactions, setIsOpeningMultipleTabs, setHasReport, setQueryParams } =
  GlobalSlice.actions;

export const namespace = 'GlobalSlice';

export default GlobalSlice.reducer;
