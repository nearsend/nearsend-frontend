import { NATIVE_TOKEN_DECIMAL_SCALE } from './../../connectors/constants';
import { setErrorMessage } from 'store/sendToken/slice';
import { NearProvider } from './type/index.d';
import { BigNumber } from 'bignumber.js';
import { ValidationError } from 'yup';
import { providers, utils } from 'near-api-js';
import { ExecutionOutcomeWithIdView } from 'near-api-js/lib/providers/provider';
import { Transaction } from '@near-wallet-selector/core';

import {
  convertToBigNumber,
  minusValue,
  greaterThan,
  convertBalance,
  convertPrice,
  divideNumber,
} from './utils/number';
import BaseWalletService from './BaseWalletService';
import { META_DATA, META_DATA_RESPONSE } from './constants';
import axios from 'axios';
import { ExecutionOutcomeWithIdExtended, FinalExecutionOutcomeExtended } from 'types';
import { ARCHIVAL_NETWORK } from 'connectors/constants';
import { store } from 'store/configStore';
import { formatNearAmount, getContractId } from './utils/nearUtils';
import HTTP_STATUS_CONTSTANTS from 'constants/httpStatus';

let nearServiceInstance: any;

export default class NearChainService extends BaseWalletService {
  private CALL_FUNCTION = 'call_function';
  private VIEW_ACCOUNT = 'view_account';
  private VIEW_ACCESS_KEY_LIST = 'view_access_key_list';
  private FUNCTION_CALL: any = 'FunctionCall';
  private DEFAULT_GAS_PRICE = '100000000';
  private FINAL = 'final';
  private MAX_GAS = '0.0000000003';

  constructor(props?: any) {
    super(props);
  }

  isAddress = (address: string): boolean | ValidationError | Promise<boolean | ValidationError> => {
    if (!address || address?.length < 2 || address?.length > 64) {
      return false;
    }
    const accountRegex = new RegExp('^(([a-zd]+[-_])*[a-zd]+.)*([a-zd]+[-_])*[a-zd]+$');

    if (accountRegex.test(address)) {
      return true;
    }

    return false;
  };

  getInstance() {
    if (nearServiceInstance == null) {
      nearServiceInstance = new NearChainService();
      nearServiceInstance.constructor = null;
    }
    return nearServiceInstance;
  }

  removeInstance() {
    nearServiceInstance = null;
  }

  parseData = (data: any) => {
    return JSON.parse(Buffer.from(data).toString());
  };

  convertToBase64 = (args: any) => {
    const argsJsonStr = args ? JSON.stringify(args) : '';
    const args_base64 = argsJsonStr ? Buffer.from(argsJsonStr).toString('base64') : '';

    return args_base64;
  };

  promiseAllInBatches = async <T>(
    task: (item: any) => any,
    items: any[],
    batchSize: number,
    callback?: (currentItem: number) => void,
  ) => {
    let position = 0;
    let results: T[] = [];

    while (position < items.length) {
      const itemsForBatch = items.slice(position, position + batchSize);
      results = [...results, ...(await Promise.all(itemsForBatch.map((item) => task(item))))];
      position += batchSize;

      if (typeof callback === 'function') {
        callback(results?.length);
      }
    }
    return results;
  };

  checkForReceiptStatus = (
    receipts: ExecutionOutcomeWithIdView[],
    receiptIds: string[],
    receiptsData: Record<string, Record<'Success' | 'Failure', Record<string, ExecutionOutcomeWithIdExtended>>>,
    transactionHash: string,
  ) => {
    receiptIds?.map((receiptId) => {
      const receiptInfo = receipts.find(({ id }) => id === receiptId);

      if (receiptInfo?.id && receiptInfo?.outcome?.receipt_ids && receiptInfo?.outcome?.receipt_ids?.length > 0) {
        if (!receiptsData?.[transactionHash]) {
          receiptsData[transactionHash] = {
            Success: {},
            Failure: {},
          };
        }

        if (receiptInfo?.outcome?.status?.hasOwnProperty('SuccessValue')) {
          receiptsData[transactionHash]['Success'][receiptInfo.id] = { ...receiptInfo, hash: transactionHash };
        } else if (receiptInfo?.outcome?.status?.hasOwnProperty('Failure')) {
          receiptsData[transactionHash]['Failure'][receiptInfo.id] = { ...receiptInfo, hash: transactionHash };
        }
      }

      this.checkForReceiptStatus(receipts, receiptInfo?.outcome?.receipt_ids || [], receiptsData, transactionHash);
    });
  };

  readBulkTransferTransactionStatus = (transactionsResult: FinalExecutionOutcomeExtended[]) => {
    const transactionReceiptData: Record<
      string,
      Record<'Success' | 'Failure', Record<string, ExecutionOutcomeWithIdExtended>>
    > = {};
    const allReceipts = [];
    const receiptsObject: Record<any, any> = {};

    for (const transaction of transactionsResult) {
      const receiptsOutcome = transaction?.receipts_outcome as ExecutionOutcomeWithIdView[];

      allReceipts.push(...transaction?.receipts);

      this.checkForReceiptStatus(
        receiptsOutcome,
        receiptsOutcome?.[0]?.outcome?.receipt_ids || [],
        transactionReceiptData,
        transaction?.transaction?.hash,
      );
    }

    for (const receipt of allReceipts) {
      if (receipt?.receiver_id) {
        receiptsObject[receipt?.receipt_id] = receipt;
      }
    }
    return { transactionReceiptData, receiptsObject };
  };

  readTransactionStatus = (transactionsResult: any[], transactions: any[]) => {
    const transactionReceiptData = [];
    const failedTransactions = [];
    const successTransactions = [];
    let transactionsSuccessStatus = true;

    for (const [i, transaction] of transactionsResult.entries()) {
      const transactionSuccessReceiptId = transaction?.transaction_outcome?.outcome?.status?.SuccessReceiptId;
      const transactionReceipts = transaction?.receipts_outcome;
      const transactionReceipt = transactionReceipts.find(
        ({ id }: { id: string }) => id === transactionSuccessReceiptId,
      );
      const outcome = transactionReceipt?.outcome?.status;

      transactionReceiptData.push(transaction);

      if (outcome?.Failure) {
        failedTransactions.push(transactions[i]);
        transactionsSuccessStatus = false;
      } else {
        successTransactions.push(transactions[i]);
      }
    }

    return { successTransactions, failedTransactions, transactionReceiptData, transactionsSuccessStatus };
  };

  batchTransactions = async ({ library, transactions }: { library: NearProvider; transactions: any[] }) => {
    if (library) {
      try {
        const wallet = await library.wallet();
        const transactionsResult = await wallet.signAndSendTransactions({ transactions });
        return transactionsResult as FinalExecutionOutcomeExtended[];
      } catch (e: any) {
        console.log(e);
        if (e?.message === 'User reject') {
          store.dispatch(setErrorMessage('message.E12'));
        }
      }
    }
  };

  getProvider = (library: NearProvider, rpc?: string): providers.JsonRpcProvider | null => {
    if (library) {
      const { network } = library.options;
      const provider = new providers.JsonRpcProvider({ url: rpc || network.nodeUrl });

      return provider;
    }
    return null;
  };

  async readBlockchainData(
    library: NearProvider,
    account_id: string | undefined,
    method_name: string,
    args?: any,
    request_type = this.CALL_FUNCTION,
    finality = this.FINAL,
  ): Promise<any> {
    if (library && account_id) {
      const provider = this.getProvider(library);
      const args_base64 = this.convertToBase64(args);

      return provider?.query({
        request_type,
        account_id,
        method_name,
        args_base64,
        finality,
      });
    }
  }

  getTokenMetadata = async ({
    library,
    data,
  }: {
    library: NearProvider | undefined | null;
    data: { tokens: string[]; batchLimit: number };
  }): Promise<any> => {
    let results: any[] = [];

    if (library) {
      const provider = this.getProvider(library);
      const { tokens, batchLimit } = data || {};

      if (tokens?.length > 0) {
        results = await this.promiseAllInBatches<{ result: META_DATA }>(
          async (tokenContract: string) => {
            try {
              const response = await provider?.query<META_DATA_RESPONSE>({
                request_type: this.CALL_FUNCTION,
                account_id: tokenContract,
                method_name: 'ft_metadata',
                args_base64: '',
                finality: this.FINAL,
              });

              const parsedResult: META_DATA = response?.result
                ? { ...this.parseData(response?.result), address: tokenContract }
                : {};

              return parsedResult;
            } catch (e) {}
          },
          tokens,
          batchLimit,
        );

        return results.filter(Boolean);
      }
    } else {
      return [];
    }
  };

  getGasPrice = async ({ library }: { library: NearProvider; account: string }): Promise<string> => {
    try {
      const provider = this.getProvider(library);
      const { gas_price = this.DEFAULT_GAS_PRICE } = (await provider?.gasPrice(null)) || {};

      return formatNearAmount(gas_price);
    } catch (e) {
      return '0';
    }
  };

  getBlockData = async ({
    library,
    data,
  }: {
    library: NearProvider;
    data: {
      blockHashes: string[];
      batchLimit: number;
      chainId: string;
    };
  }) => {
    let results: any[] = [];

    if (library) {
      const { blockHashes, batchLimit, chainId } = data || {};

      const provider = this.getProvider(library, ARCHIVAL_NETWORK[chainId]);

      if (blockHashes?.length > 0) {
        results = await this.promiseAllInBatches(
          async (blockHash: any) => {
            try {
              const response = await provider?.block(blockHash);
              return response;
            } catch (e) {}
          },
          blockHashes,
          batchLimit,
        );

        return results.filter(Boolean);
      }
    } else {
      return [];
    }
  };

  getStorageFee = async ({
    library,
    data,
    callback,
  }: {
    library: NearProvider;
    data: {
      listData: any[];
      batchLimit: number;
      tokenContract: string;
    };
    callback?: (current: number) => void;
  }) => {
    let results: any[] = [];

    if (library) {
      const provider = this.getProvider(library);
      const { listData, batchLimit, tokenContract } = data || {};

      if (listData?.length > 0) {
        results = await this.promiseAllInBatches<{ result: META_DATA }>(
          async (item: any) => {
            try {
              const args_base64 = item?.address ? this.convertToBase64({ account_id: item?.address }) : '';

              const response = await provider?.query<any>({
                request_type: this.CALL_FUNCTION,
                account_id: tokenContract,
                method_name: 'storage_balance_of',
                args_base64,
                finality: this.FINAL,
              });
              const parsedResult = response?.result ? this.parseData(response?.result) : {};

              return {
                address: item?.address,
                total: formatNearAmount(parsedResult?.total) || 0,
                available: formatNearAmount(parsedResult?.available) || 0,
              };
            } catch (e) {}
          },
          listData,
          batchLimit,
          callback,
        );

        return results.filter(Boolean);
      }
    } else {
      return [];
    }
  };

  getTransactionStatus = async ({
    library,
    txHash,
    account,
  }: {
    library: NearProvider;
    txHash: string[];
    account: string;
  }) => {
    const { network } = library.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    return Promise.all(txHash.map((hash) => provider.txStatus(hash, account)));
  };

  getTransactionStatusReceipts = async ({
    library,
    txHash,
    account,
  }: {
    library: NearProvider;
    txHash: string[];
    account: string;
  }) => {
    const { network } = library.options;

    return Promise.all(
      txHash.map((hash) =>
        axios.post(network.nodeUrl, {
          id: '',
          jsonrpc: '2.0',
          method: 'EXPERIMENTAL_tx_status',
          params: [hash, account],
        }),
      ),
    );
  };

  getStorageBalanceBounds = async ({
    library,
    data,
  }: {
    library: NearProvider;
    data: {
      tokenContract: string;
    };
  }): Promise<any> => {
    try {
      const { tokenContract } = data || {};

      const storageBalanceBoundsData = await this.readBlockchainData(library, tokenContract, 'storage_balance_bounds');
      const { min, max } = this.parseData(storageBalanceBoundsData?.result);

      return { min: formatNearAmount(min) || 0, max: formatNearAmount(max) || 0 };
    } catch (e) {
      return null;
    }
  };

  getAccountPaymentForServiceFee = async ({
    library,
    account,
  }: {
    library: NearProvider;
    account: string;
  }): Promise<any> => {
    try {
      const serviceFeeCountPromise = await this.readBlockchainData(
        library,
        getContractId(library),
        'get_account_quota',
        {
          account_id: account,
        },
      );
      const serviceFeeCount = this.parseData(serviceFeeCountPromise?.result);

      return serviceFeeCount;
    } catch (e) {
      return null;
    }
  };

  getServiceFee = async ({ library }: { library: NearProvider }): Promise<any> => {
    try {
      // const serviceFeePromise = await this.readBlockchainData(library, getContractId(library), 'service_fee');
      // const serviceFee = this.parseData(serviceFeePromise?.result);
      // const serviceFeeExchangeResponse = await axios.get(
      //  `${import.meta.env.VITE_COIN_GECKO_API}/price?ids=${['near']}&vs_currencies=usd`,
      // );

      return (
        formatNearAmount(
          convertPrice(
            divideNumber(
              convertToBigNumber(import.meta.env.VITE_SERVICE_FEE_USD_PER_ACCOUNT || 0),
              // serviceFeeExchangeResponse.data?.['near']?.usd,
              '1.29' // TEMP HACK
            ),
            NATIVE_TOKEN_DECIMAL_SCALE,
          ).toString(),
        ) || 0
      );
    } catch (e) {
      return null;
    }
  };

  getBalance = async ({
    library,
    account,
    data,
  }: {
    library: NearProvider;
    account: string;
    data?: { token: any };
  }): Promise<BigNumber> => {
    try {
      const { token } = data || {};
      let balance: BigNumber = convertToBigNumber(0);

      if (token) {
        //Fungible token amount
        const data = await this.readBlockchainData(library, token?.address, 'ft_balance_of', { account_id: account });
        const result = this.parseData(data?.result);

        balance = convertBalance(result, token?.decimals);
      } else {
        //NEAR Amount
        const data = await this.readBlockchainData(library, account, '', null, this.VIEW_ACCOUNT);
        const MIN_BALANCE_FOR_GAS = 0.05;
        const availableBalance = minusValue([
          formatNearAmount(data?.amount),
          MIN_BALANCE_FOR_GAS,
          data?.storage_usage / 100000,
        ]);
        balance = convertToBigNumber(greaterThan(0, availableBalance) ? 0 : availableBalance);
      }

      return balance;
    } catch (e) {
      throw e;
    }
  };

  sendNear = ({
    library,
    account,
    data,
  }: {
    library: NearProvider;
    account: string;
    data: { receivers: string[]; amount: string[]; totalAmount: string };
  }): Transaction => {
    const { receivers, amount, totalAmount } = data || {};

    return {
      signerId: account,
      receiverId: getContractId(library),
      actions: [
        {
          type: this.FUNCTION_CALL,
          params: {
            methodName: 'distribute_near',
            args: {
              receivers,
              amount,
            },
            gas: utils.format.parseNearAmount(this.MAX_GAS) as string,
            deposit: totalAmount,
          },
        },
      ],
    };
  };

  sendToken = ({
    library,
    account,
    data,
  }: {
    library: NearProvider;
    account: string;
    data: { msg: string; amount: number; tokenContract: string };
  }): Transaction => {
    const { msg, amount, tokenContract } = data || {};

    return {
      signerId: account,
      receiverId: tokenContract,
      actions: [
        {
          type: this.FUNCTION_CALL,
          params: {
            methodName: 'ft_transfer_call',
            args: {
              msg,
              amount: amount.toString(),
              receiver_id: getContractId(library),
            },
            gas: utils.format.parseNearAmount(this.MAX_GAS) as string,
            deposit: '1',
          },
        },
      ],
    };
  };

  payForServiceFee = ({
    library,
    data,
    account,
  }: {
    library: NearProvider;
    data: { serviceFee?: number; totalAccountPayingFor?: number };
    account: string;
  }): Transaction => {
    const { serviceFee = 0, totalAccountPayingFor = 0 } = data || {};

    const transaction = {
      signerId: account,
      receiverId: getContractId(library),
      actions: [
        {
          type: this.FUNCTION_CALL,
          params: {
            methodName: 'pay_service_fee',
            args: {
              estimated_fee:
                totalAccountPayingFor > 0
                  ? divideNumber(
                      convertToBigNumber(utils.format.parseNearAmount(convertToBigNumber(serviceFee).toString()) || 0),
                      convertToBigNumber(totalAccountPayingFor),
                    )
                  : 0,
            },
            gas: utils.format.parseNearAmount(this.MAX_GAS) as string,
            deposit: utils.format.parseNearAmount(convertToBigNumber(serviceFee).toString()) as string,
          },
        },
      ],
    };

    return transaction;
  };

  payForStorageFee = ({
    library,
    data,
    account,
  }: {
    library: NearProvider;
    data: { account_ids: string[]; tokenContract?: string; min_fee: number; totalFee: number };
    account: string;
  }): Transaction => {
    const { account_ids, tokenContract, min_fee, totalFee } = data || {};

    return {
      signerId: account,
      receiverId: getContractId(library),
      actions: [
        {
          type: this.FUNCTION_CALL,
          params: {
            methodName: 'batch_storage_deposit',
            args: {
              token_id: tokenContract,
              account_ids,
              min_fee: utils.format.parseNearAmount(convertToBigNumber(min_fee).toString()),
            },
            gas: utils.format.parseNearAmount(this.MAX_GAS) as string,
            deposit: utils.format.parseNearAmount(convertToBigNumber(totalFee).toString()) as string,
          },
        },
      ],
    };
  };
}