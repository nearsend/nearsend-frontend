export const COLUMN_KEY = {
  NO: 'no',
  TX_TIME: 'txTime',
  TX_HASH: 'txHash',
  SENDER: 'sender',
  SMART_CONTRACT: 'smartContract',
  RECIPIENT: 'recipient',
  AMOUNT: 'amount',
  TOKEN_TICKER: 'tokenTicker',
  TOKEN_ADDRESS: 'tokenAddress',
  STATUS: 'status',
  GAS_FEE: 'gasFee',
};

export const COLUMN_HEADERS = [
  {
    title: 'report.no',
    key: COLUMN_KEY.NO,
    excelWidth: 8,
  },
  {
    title: 'report.tx_time',
    key: COLUMN_KEY.TX_TIME,
    excelWidth: 15.86,
  },
  {
    title: 'report.tx_hash',
    key: COLUMN_KEY.TX_HASH,
    excelWidth: 17.14,
  },
  {
    title: 'report.sender',
    key: COLUMN_KEY.SENDER,
    excelWidth: 21.57,
  },
  {
    title: 'report.smart_contract',
    key: COLUMN_KEY.SMART_CONTRACT,
    excelWidth: 31.71,
  },
  {
    title: 'report.recipient',
    key: COLUMN_KEY.RECIPIENT,
    excelWidth: 18.86,
  },
  {
    title: 'report.amount',
    key: COLUMN_KEY.AMOUNT,
    excelWidth: 14.43,
  },
  {
    title: 'report.token_ticker',
    key: COLUMN_KEY.TOKEN_TICKER,
    excelWidth: 16.43,
  },
  {
    title: 'report.token_address',
    key: COLUMN_KEY.TOKEN_ADDRESS,
    excelWidth: 16.71,
  },
  {
    title: 'report.status',
    key: COLUMN_KEY.STATUS,
    excelWidth: 18.57,
  },
  {
    title: 'report.gas_fee',
    key: COLUMN_KEY.GAS_FEE,
    excelWidth: 8,
  },
];
