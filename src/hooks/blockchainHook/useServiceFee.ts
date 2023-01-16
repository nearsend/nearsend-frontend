import { useState, useEffect } from 'react';
import { useAppDispatch } from '../useStore';
import { useChainFactory } from 'hooks/walletHook/useChainFactory';
import { setAppLoading } from 'store/global/slice';
import { Transaction } from '@near-wallet-selector/core';
import TYPE_CONSTANTS from 'constants/type';
import showMessage from 'components/Message';
import { CONTRACT_ID } from 'connectors/constants';
import { addValue, multiplyValue } from 'services/WalletService/utils/number';

const CHUNK_SIZE = 35;

const useServiceFee = (listAddressToSendLength: number) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [serviceFee, setServiceFee] = useState(0);
  const [totalServiceFee, setTotalServiceFee] = useState(0);
  const [accountPaymentForServiceFee, setAccountPaymentForServiceFee] = useState(0);
  const [totalAccountPayingFor, setTotalAccountPayingFor] = useState(0);

  const dispatch = useAppDispatch();

  const { getConnectedChainInfo, getWallet } = useChainFactory();

  useEffect(() => {
    const totalServiceFeeNeedToPay = calculateServiceFee(
      listAddressToSendLength,
      accountPaymentForServiceFee,
      serviceFee,
    );

    setTotalServiceFee(totalServiceFeeNeedToPay);
  }, [listAddressToSendLength, serviceFee, accountPaymentForServiceFee]);

  const calculateServiceFee = (listAddressLength: number, accountPaymentForServiceFee: number, serviceFee: any) =>
    listAddressLength - accountPaymentForServiceFee > 0
      ? multiplyValue([listAddressLength - accountPaymentForServiceFee, serviceFee])
      : 0;

  const getServiceFee = async () => {
    const { library, account } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    dispatch(setAppLoading(false));
    try {
      if (account && library) {
        //User has pay enough service fee to enable they to send token to accountPaymentForServiceFee accounts
        const [accountPaymentForServiceFee, serviceFee] = await Promise.all([
          wallet?.getAccountPaymentForServiceFee({
            library,
            account,
          }),
          wallet?.getServiceFee({
            library,
          }),
        ]);

        const totalServiceFeeNeedToPay = calculateServiceFee(
          listAddressToSendLength,
          accountPaymentForServiceFee,
          serviceFee,
        );

        setTotalAccountPayingFor(listAddressToSendLength - accountPaymentForServiceFee);
        setAccountPaymentForServiceFee(accountPaymentForServiceFee);
        setServiceFee(serviceFee);

        return {
          serviceFee: totalServiceFeeNeedToPay,
          totalAccountPayingFor: listAddressToSendLength - accountPaymentForServiceFee,
        };
      }
    } catch (e) {
    } finally {
      dispatch(setAppLoading(false));
    }
  };

  const payForServiceFee = async ({
    serviceFee,
    listAddressNeedStorageFee,
    tokenContract,
    retryTransactions,
    appContractStorageFeeNeed,
    totalAccountPayingFor,
  }: {
    serviceFee?: number;
    listAddressNeedStorageFee?: any[];
    tokenContract?: string;
    appContractStorageFeeNeed?: number;
    retryTransactions?: any[];
    totalAccountPayingFor?: number;
  }): Promise<
    | {
        transactionReceiptData?: any[];
        transactionsSuccessStatus?: boolean;
        failedTransactions?: any[];
        errorMessage?: string;
        successTransactions?: any[];
      }
    | undefined
  > => {
    const { library, account, chainId } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    setIsProcessing(true);

    try {
      if (account && library && chainId) {
        let transactions: Transaction[] = [];

        const serviceFeeRequest = wallet?.payForServiceFee({
          library,
          account,
          data: { serviceFee, totalAccountPayingFor },
        });

        if (appContractStorageFeeNeed) {
          const appContractStorageFeeRequest: any =
            [
              wallet?.payForStorageFee({
                library,
                account,
                data: {
                  tokenContract,
                  account_ids: [CONTRACT_ID[chainId as string]],
                  min_fee: appContractStorageFeeNeed,
                  totalFee: appContractStorageFeeNeed,
                },
              }),
            ] || [];

          transactions.push(...appContractStorageFeeRequest);
        }

        const storageFeeRequest = listAddressNeedStorageFee?.reduce((result, value, index, array) => {
          if (index % CHUNK_SIZE === 0) {
            const max_slice = Math.min(index + CHUNK_SIZE, listAddressNeedStorageFee?.length);
            const { account_ids, min_fee, totalFee } = array.slice(index, max_slice).reduce(
              (acc, cur) =>
                (acc = {
                  account_ids: acc.account_ids.concat(cur?.address),
                  min_fee: cur?.storageFeeNeed,
                  totalFee: addValue([acc.totalFee, cur?.storageFeeNeed]),
                }),
              { account_ids: [], min_fee: 0, totalFee: 0 },
            );

            result.push(
              wallet?.payForStorageFee({
                library,
                account,
                data: {
                  tokenContract,
                  account_ids,
                  min_fee,
                  totalFee,
                },
              }),
            );
          }
          return result;
        }, []);

        if (retryTransactions) {
          transactions = retryTransactions;
        } else {
          if (serviceFee && serviceFee.toString() !== '0' && serviceFeeRequest) {
            transactions.push(serviceFeeRequest);
          }

          transactions.push(...(storageFeeRequest || []));
        }

        if (transactions?.length > 0) {
          const batchTransactionsResult = await wallet?.batchTransactions({ library, transactions });

          if (!batchTransactionsResult) {
            return;
          }

          let errorMessage = '';

          const {
            transactionsSuccessStatus,
            failedTransactions = [],
            successTransactions,
          } = wallet?.readTransactionStatus(batchTransactionsResult || [], transactions || []) || {};

          if (failedTransactions?.length === transactions?.length) {
            errorMessage = 'message.E11';
          }

          if (failedTransactions?.length > 0 && failedTransactions?.length < transactions?.length) {
            errorMessage = 'message.E13';
          }

          if (failedTransactions?.length === 0) {
            showMessage(TYPE_CONSTANTS.MESSAGE.SUCCESS, 'message.S2');
          }

          return { transactionsSuccessStatus, errorMessage, failedTransactions, successTransactions };
        } else {
          return { transactionsSuccessStatus: true };
        }
      }
    } catch (e) {
      return { transactionsSuccessStatus: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    getServiceFee,
    payForServiceFee,
    isProcessing,
    serviceFee,
    totalServiceFee,
    totalAccountPayingFor,
  };
};

export default useServiceFee;
