import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import get from 'lodash/get';
import { ExecutionOutcomeWithIdView } from 'near-api-js/lib/providers/provider';
import BigNumber from 'bignumber.js';
import { utils } from 'near-api-js';

import { useChainFactory } from 'hooks/walletHook/useChainFactory';
import { CHUNK_SIZE, STEPS, useSendToken } from 'context/SendTokenContext';
import { ExecutionOutcomeWithIdExtended, FinalExecutionOutcomeExtended } from 'types';
import useGetTransactionStatus from './useGetTransactionStatus';
import { addValue, convertPrice } from 'services/WalletService/utils/number';
import { BROWSER_WALLETS, NATIVE_TOKEN, NATIVE_TOKEN_DECIMAL_SCALE } from 'connectors/constants';
import { useAppDispatch, useAppSelector } from './../useStore';
import { setAppLoading, setLoadingTransactions } from 'store/global/slice';
import { META_DATA } from 'services/WalletService/constants';
import selectSendToken from 'store/sendToken/selector';
import { setTransactionHashes } from 'store/sendToken/slice';
import useListAddress from 'hooks/layoutHook/useListAddress';
import selectedConnection from 'store/connection/selector';
import selectGlobalState from 'store/global/selector';
import { getSendFtTokenParamsFromReceipt, getSendNEARAmountFromReceipt } from 'services/WalletService/utils/nearUtils';

export type BulkSendProps = { account_id: string; amount: BigNumber | string };

export enum TRANSACTION_STATUS {
  ALL_FINISHED = 1,
  ALL_FAILED = 2,
  SOME_FAILED = 3,
}

const useBulkSendToken = (navigate: (step: number) => () => void) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const { listAddressToSend, tokenInfo, setTokenInfo, setListAddress, setListAddressToSend } = useSendToken();
  const { getConnectedChainInfo, getWallet } = useChainFactory();
  const { getTransactionStatus } = useGetTransactionStatus();
  const { getListAddress, updateListAddress } = useListAddress();

  const [transactionsStatus, setTransactionsStatus] = useState<TRANSACTION_STATUS | null>(null);
  const [failedReceipts, setFailedReceipts] = useState<any>({});
  const [successReceipts, setSuccessReceipts] = useState<any>({});
  const [batchTransactionsResult, setBatchTransactionsResult] = useState<FinalExecutionOutcomeExtended[]>([]);
  const [transactions, setTransactions] = useState<
    [string, Record<'Success' | 'Failure', Record<string, ExecutionOutcomeWithIdView>>][]
  >([]);
  const [receipts, setReceipts] = useState({});

  const transactionHashes = useAppSelector(selectSendToken.getTransactionHashes);
  const connectedWalletType = useAppSelector(selectedConnection.getConnectedWalletTypeByNetwork);
  const hasReport = useAppSelector(selectGlobalState.getIsCurrentScreenHasReport);

  useEffect(() => {
    if (transactionHashes?.length > 0) {
      (async () => await getTransactionsReceipts(transactionHashes))();
      dispatch(setTransactionHashes([]));
    }
  }, [transactionHashes]);

  useEffect(() => {
    const getTokenInfo = async () => {
      let tokenInfo: META_DATA | null = null;

      for (const transaction of batchTransactionsResult) {
        const methodName = get(transaction, ['transaction', 'actions', '0', 'FunctionCall', 'method_name']);

        //Is sending NEAR transactions
        if (['distribute_near'].includes(methodName)) {
          tokenInfo = {
            value: NATIVE_TOKEN,
            token: 'Near',
            symbol: NATIVE_TOKEN,
            address: 'Native token',
            icon: '/src/resources/svg/near_icon.svg',
            decimals: NATIVE_TOKEN_DECIMAL_SCALE,
          };
          break;
        }

        //Is sending FT Token transactions
        if (['ft_transfer_call'].includes(methodName)) {
          const getFtTokenInfo = async (): Promise<META_DATA | null> => {
            try {
              const { library } = getConnectedChainInfo() || {};
              const wallet = getWallet();

              const response = await wallet?.getTokenMetadata({
                library,
                data: { tokens: [batchTransactionsResult[0]?.transaction?.receiver_id], batchLimit: 25 },
              });

              return {
                address: batchTransactionsResult[0]?.transaction?.receiver_id,
                token: response?.[0]?.name,
                symbol: response?.[0]?.symbol,
                icon: response?.[0]?.icon,
                decimals: response?.[0]?.decimals,
                value: batchTransactionsResult[0]?.transaction?.receiver_id,
              };
            } catch (e) {
              return null;
            }
          };
          tokenInfo = await getFtTokenInfo();
          break;
        }
      }

      if (tokenInfo) {
        setTokenInfo(tokenInfo);
        const listAddressId = await getListAddress();
        await updateListAddress(listAddressId, []);

        if (tokenInfo?.value === NATIVE_TOKEN) {
          checkForSendTokenTransactionStatus(batchTransactionsResult);
        } else {
          checkForFtTransferTransactionsStatus(batchTransactionsResult);
        }
      }
    };

    if (batchTransactionsResult?.length > 0) {
      getTokenInfo();
    }
  }, [batchTransactionsResult]);

  const getTransactionsReceipts = async (transactionHashes: string[]) => {
    dispatch(setAppLoading(true));

    try {
      const transactionsStatus: FinalExecutionOutcomeExtended[] = (await getTransactionStatus(transactionHashes)) || [];
      setBatchTransactionsResult(transactionsStatus);
    } catch (e) {
    } finally {
      dispatch(setAppLoading(false));
    }
  };

  const handleSetTransactionStatus = (
    transferEventFailedReceipts: Record<string, any>,
    transferEventSuccessReceipts: Record<string, any>,
    receiptsObject: Record<any, any>,
    transactionReceiptData: Record<
      string,
      Record<'Success' | 'Failure', Record<string, ExecutionOutcomeWithIdExtended>>
    >,
  ) => {
    let transactionsStatus = null;
    //Some transactions finished
    if (Object.keys(transferEventFailedReceipts)?.length > 0 && Object.keys(transferEventSuccessReceipts)?.length > 0) {
      transactionsStatus = TRANSACTION_STATUS.SOME_FAILED;
    }
    //All transactions failed
    else if (
      Object.keys(transferEventFailedReceipts)?.length > 0 &&
      Object.keys(transferEventSuccessReceipts)?.length === 0
    ) {
      transactionsStatus = TRANSACTION_STATUS.ALL_FAILED;
    }
    //Some transaction failed
    else if (
      Object.keys(transferEventFailedReceipts)?.length === 0 &&
      Object.keys(transferEventSuccessReceipts)?.length > 0
    ) {
      transactionsStatus = TRANSACTION_STATUS.ALL_FINISHED;
    } else {
      //All transactions failed
      transactionsStatus = TRANSACTION_STATUS.ALL_FAILED;
    }

    setReceipts(receiptsObject);
    setFailedReceipts(transferEventFailedReceipts);
    setSuccessReceipts(transferEventSuccessReceipts);
    setTransactionsStatus(transactionsStatus);
    setTransactions(Object.entries(transactionReceiptData));
  };

  const checkForSendTokenTransactionStatus = (batchTransactionsResult: FinalExecutionOutcomeExtended[]) => {
    const wallet = getWallet();

    const { transactionReceiptData = {}, receiptsObject = {} } =
      wallet?.readBulkTransferTransactionStatus(batchTransactionsResult || []) || {};

    let failedReceipts: Record<string, ExecutionOutcomeWithIdView> = {},
      successReceipts: Record<string, ExecutionOutcomeWithIdView> = {};

    for (const { Failure, Success } of Object.values(transactionReceiptData)) {
      failedReceipts = { ...failedReceipts, ...Failure };
      successReceipts = { ...successReceipts, ...Success };
    }

    const transferEventFailedReceipts: Record<string, any> = {},
      transferEventSuccessReceipts: Record<string, any> = {},
      refundEventsReceipts: Record<string, any> = {};
    for (const receipt of Object.values(failedReceipts)) {
      if (
        receiptsObject[receipt?.id] &&
        !!get(receiptsObject, [receipt?.id, 'receipt', 'Action', 'actions', '0', 'Transfer'])
      ) {
        transferEventFailedReceipts[receipt?.id] = { ...receiptsObject[receipt?.id] };
      }
    }
    for (const receipt of Object.values(successReceipts)) {
      //If event callback_distribute_near has logs => Refund event => Remove receipts from list success
      if (
        receipt?.outcome?.logs?.length > 0 &&
        receiptsObject[receipt?.id] &&
        !!(
          get(receiptsObject, [receipt?.id, 'receipt', 'Action', 'actions', '0', 'FunctionCall', 'method_name']) ===
          'callback_transfer_near'
        )
      ) {
        for (const receiptId of receipt?.outcome?.receipt_ids) {
          refundEventsReceipts[receiptId] = receiptId;
        }
      }

      //If is Transfer event but refund => Remove receipts from list success
      if (
        receiptsObject[receipt?.id] &&
        !!get(receiptsObject, [receipt?.id, 'receipt', 'Action', 'actions', '0', 'Transfer']) &&
        !refundEventsReceipts[receipt?.id]
      ) {
        transferEventSuccessReceipts[receipt?.id] = { ...receiptsObject[receipt?.id] };
      }
    }

    handleSetTransactionStatus(
      transferEventFailedReceipts,
      transferEventSuccessReceipts,
      receiptsObject,
      transactionReceiptData,
    );
  };

  const checkForFtTransferTransactionsStatus = (batchTransactionsResult: FinalExecutionOutcomeExtended[]) => {
    const wallet = getWallet();

    const { transactionReceiptData = {}, receiptsObject = {} } =
      wallet?.readBulkTransferTransactionStatus(batchTransactionsResult || []) || {};

    let failedReceipts: Record<string, ExecutionOutcomeWithIdView> = {},
      successReceipts: Record<string, ExecutionOutcomeWithIdView> = {};

    for (const { Failure, Success } of Object.values(transactionReceiptData)) {
      failedReceipts = { ...failedReceipts, ...Failure };
      successReceipts = { ...successReceipts, ...Success };
    }

    const transferEventFailedReceipts: Record<string, any> = {},
      transferEventSuccessReceipts: Record<string, any> = {};
    for (const receipt of Object.values(failedReceipts)) {
      if (
        receiptsObject[receipt?.id] &&
        ['ft_on_transfer'].includes(
          get(receiptsObject, [
            receipt?.id,
            'receipt',
            'Action',
            'actions',
            '0',
            'FunctionCall',
            'method_name',
          ]) as string,
        )
      ) {
        transferEventFailedReceipts[receipt?.id] = { ...receiptsObject[receipt?.id] };
      }
    }
    for (const receipt of Object.values(successReceipts)) {
      if (
        receiptsObject[receipt?.id] &&
        ['ft_transfer'].includes(
          get(receiptsObject, [
            receipt?.id,
            'receipt',
            'Action',
            'actions',
            '0',
            'FunctionCall',
            'method_name',
          ]) as string,
        )
      ) {
        transferEventSuccessReceipts[receipt?.id] = { ...receiptsObject[receipt?.id] };
      }
    }

    handleSetTransactionStatus(
      transferEventFailedReceipts,
      transferEventSuccessReceipts,
      receiptsObject,
      transactionReceiptData,
    );
  };

  const bulkSendNear = async ({
    serviceFee,
    totalAccountPayingFor,
  }: {
    serviceFee: number;
    totalAccountPayingFor: number;
  }) => {
    const { account, library } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    dispatch(setLoadingTransactions(true));

    if (library && account) {
      try {
        const serviceFeeRequest = wallet?.payForServiceFee({
          library,
          account,
          data: { serviceFee, totalAccountPayingFor },
        });

        const bulkSenderAccounts: any[] = listAddressToSend.reduce((acc: BulkSendProps[], cur) => {
          acc.push({ account_id: cur?.address, amount: utils.format.parseNearAmount(cur?.amount.toString()) || '0' });
          return acc;
        }, []);

        const transactions = [];

        if (serviceFee && serviceFee.toString() !== '0' && serviceFeeRequest) {
          transactions.push(serviceFeeRequest);
        }

        const sendNearTransactions = bulkSenderAccounts.reduce((result, value, index, array) => {
          if (index % CHUNK_SIZE.NATIVE_TOKEN === 0) {
            const max_slice = Math.min(index + CHUNK_SIZE.NATIVE_TOKEN, bulkSenderAccounts.length);
            const { receivers, amount, totalAmount } = array.slice(index, max_slice).reduce(
              (acc, cur) =>
                (acc = {
                  receivers: acc.receivers.concat(cur?.account_id),
                  amount: acc.amount.concat(cur?.amount),
                  totalAmount: addValue([acc.totalAmount, cur?.amount]),
                }),
              { receivers: [], amount: [], totalAmount: 0 },
            );

            result.push(
              wallet?.sendNear({
                library,
                account,
                data: {
                  receivers,
                  amount,
                  totalAmount,
                },
              }),
            );
          }
          return result;
        }, []);

        transactions.push(...sendNearTransactions);

        await handleTransactions(transactions);
      } catch (e) {
        console.log(e);
        if (BROWSER_WALLETS.includes(connectedWalletType)) {
          dispatch(setLoadingTransactions(false));
        }
      } finally {
        if (!BROWSER_WALLETS.includes(connectedWalletType)) {
          dispatch(setLoadingTransactions(false));
        }
      }
    }
  };

  const bulkSendFtToken = async () => {
    const { account, library } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    dispatch(setLoadingTransactions(true));

    if (library && account) {
      try {
        const bulkSenderAccounts: any[] = listAddressToSend.reduce((acc: BulkSendProps[], cur) => {
          acc.push({ account_id: cur?.address, amount: convertPrice(cur?.amount, tokenInfo?.decimals) });
          return acc;
        }, []);

        const transactions = bulkSenderAccounts.reduce((result, value, index, array) => {
          if (index % CHUNK_SIZE.FT_TOKEN === 0) {
            const max_slice = Math.min(index + CHUNK_SIZE.FT_TOKEN, bulkSenderAccounts.length);
            const { msg, amount } = array.slice(index, max_slice).reduce(
              (acc, cur, index) =>
                (acc = {
                  msg: (acc.msg += `${index === 0 ? '' : '#'}${cur?.account_id}:${cur?.amount}`),
                  amount: (acc.amount = addValue([acc.amount, cur?.amount])),
                }),
              { msg: '', amount: 0 },
            );

            result.push(
              wallet?.sendToken({
                library,
                account,
                data: {
                  msg,
                  amount,
                  tokenContract: tokenInfo?.address,
                },
              }),
            );
          }
          return result;
        }, []);

        await handleTransactions(transactions);
      } catch (e) {
        console.log(e);
        if (BROWSER_WALLETS.includes(connectedWalletType)) {
          dispatch(setLoadingTransactions(false));
        }
      } finally {
        if (!BROWSER_WALLETS.includes(connectedWalletType)) {
          dispatch(setLoadingTransactions(false));
        }
      }
    }
  };

  const handleTransactions = async (transactions: any[]) => {
    const { account, library } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    if (library && account) {
      if (transactions?.length > 0) {
        const batchTransactionsResult = await wallet?.batchTransactions({ library, transactions });

        if (!batchTransactionsResult) {
          return;
        }

        getTransactionsReceipts(batchTransactionsResult.map(({ transaction }) => transaction?.hash));
      }
    }
  };

  const retryTransaction = (stepToGoBack?: number) => () => {
    if (hasReport) {
      const promtGoBack = confirm(t('send_token.confirm_go_back'));

      if (!promtGoBack) {
        return;
      }
    }

    let listAddressToRetry: any = [];

    if (tokenInfo?.value === NATIVE_TOKEN) {
      listAddressToRetry = Object.values(failedReceipts)?.map((receipt: any) => ({
        address: receipt?.receiver_id,
        amount: getSendNEARAmountFromReceipt(receipt),
      }));
    } else {
      listAddressToRetry = Object.values(failedReceipts)?.map((receipt: any) => {
        const { address, amount } = getSendFtTokenParamsFromReceipt(receipt, tokenInfo) || {};

        return {
          address,
          amount,
        };
      });
    }

    setListAddress(listAddressToRetry);
    setListAddressToSend(listAddressToRetry);

    navigate(stepToGoBack || STEPS.SETUP)();
  };

  return {
    bulkSendFtToken,
    bulkSendNear,
    transactionsStatus,
    transactions,
    failedReceipts,
    successReceipts,
    retryTransaction,
    receipts,
    setTransactions,
    setTransactionsStatus,
  };
};

export default useBulkSendToken;
