const selectSendToken = {
  getSendTokenInfo: (state: any) => state?.SendTokenSlice?.tokenInfo,
  getTransactionHashes: (state: any) => state?.SendTokenSlice?.transactionHashes,
  getErrorMessage: (state: any) => state?.SendTokenSlice?.errorMessage,
};

export default selectSendToken;
