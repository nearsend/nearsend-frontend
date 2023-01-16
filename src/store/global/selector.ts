const selectGlobalState = {
  getAppLoading: (state: any) => state?.GlobalSlice?.appLoading,
  getLoadingTransactions: (state: any) => state?.GlobalSlice?.loadingTransactions,
  getIsOpeningMultipleTabs: (state: any) => state?.GlobalSlice?.isOpeningMultipleTabs,
  getIsCurrentScreenHasReport: (state: any) => state?.GlobalSlice?.hasReport,
  getQueryParams: (state: any) => state?.GlobalSlice?.queryParams,
};

export default selectGlobalState;
