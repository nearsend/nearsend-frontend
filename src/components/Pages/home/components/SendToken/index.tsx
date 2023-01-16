import { FC, useMemo, memo, useEffect } from 'react';
import { Row, Col, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';

import AppButton from 'components/AppButton';
import LoadingComponent from 'components/Loading';
import IconSuccess from 'resources/svg/IconSuccess';
import IconWarningOutline from 'resources/svg/IconWarningOutline';
import IconError from 'resources/svg/IconError';
import IconExclaimable from 'resources/svg/IconExclaimable';
import IconFailed from 'resources/svg/IconFailed';
import IconArrowRight from 'resources/svg/IconArrowRight';
import DownloadTransactionReport from './components/DownloadTransactionReport';
import useBulkSendToken, { TRANSACTION_STATUS } from 'hooks/blockchainHook/useBulkSendToken';
import { STEPS, useSendToken } from 'context/SendTokenContext';
import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import { getBlockExplorerLink } from 'services/WalletService/utils';
import selectSendToken from 'store/sendToken/selector';
import selectGlobalState from 'store/global/selector';
import useServiceFee from 'hooks/blockchainHook/useServiceFee';
import { BROWSER_WALLETS, NATIVE_TOKEN } from 'connectors/constants';
import { convertToBigNumber } from 'services/WalletService/utils/number';
import useRefetchListAddress from 'hooks/layoutHook/useRefetchListAddress';
import selectedConnection from 'store/connection/selector';
import { setHasReport } from 'store/global/slice';

type SendTokenProps = {
  navigate: (step: number) => () => void;
};

const { Paragraph } = Typography;

const TRANSACTION_STATUS_MESSAGE = {
  [TRANSACTION_STATUS.ALL_FINISHED]: 'message.S1',
  [TRANSACTION_STATUS.ALL_FAILED]: 'message.E11',
  [TRANSACTION_STATUS.SOME_FAILED]: 'message.E10',
};

const SendToken: FC<SendTokenProps> = ({ navigate }) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  useRefetchListAddress();
  const { tokenInfo, listAddressToSend, setListAddress, setTokenInfo } = useSendToken();
  const {
    bulkSendFtToken,
    bulkSendNear,
    transactionsStatus,
    transactions,
    retryTransaction,
    successReceipts,
    failedReceipts,
  } = useBulkSendToken(navigate);
  const { getServiceFee } = useServiceFee(listAddressToSend?.length);
  const { chainId } = useAppSelector(selectedAddress.getAddress);
  const isLoading = useAppSelector(selectGlobalState.getLoadingTransactions);
  const connectedWalletType = useAppSelector(selectedConnection.getConnectedWalletTypeByNetwork);
  const errorMessage = useAppSelector(selectSendToken.getErrorMessage);
  const hasReport = useAppSelector(selectGlobalState.getIsCurrentScreenHasReport);

  const isSendingNEAR = tokenInfo?.value === NATIVE_TOKEN;
  const isConnectingBrowserWallet = BROWSER_WALLETS.includes(connectedWalletType);

  useEffect(() => {
    if (listAddressToSend?.length > 0) {
      (async () => {
        const { serviceFee = 0, totalAccountPayingFor = 0 } = (await getServiceFee()) || {};

        if (isSendingNEAR) {
          bulkSendNear({ serviceFee, totalAccountPayingFor });
        } else {
          if (convertToBigNumber(serviceFee).toNumber() !== 0) return;
          bulkSendFtToken();
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (errorMessage) {
      navigate(STEPS.SUMMARY)();
    }
  }, [errorMessage]);

  const transactionsDetail = useMemo(
    () =>
      transactions.map(([hash, transactionDetails], index) => {
        const transactionSuccess = !!(
          Object.keys(transactionDetails?.Failure)?.length === 0 && Object.keys(transactionDetails?.Success)?.length > 0
        );
        const transactionFailed = !!(Object.keys(transactionDetails?.Failure)?.length > 0);

        return (
          <div
            className={cx('send-token__transaction', {
              success: transactionSuccess,
              failed: transactionFailed,
            })}
            key={hash}
          >
            <Row>
              <Col className="index" span={2}>
                {index + 1}
              </Col>
              <Col className="dash" span={1}>
                -
              </Col>
              <Col className="transaction" span={19}>
                <a key={index} href={getBlockExplorerLink(chainId, hash)} target="_blank" rel="noreferrer">
                  {hash}
                </a>
              </Col>
              <Col className="status" span={2}>
                {transactionSuccess && <IconSuccess />}
                {transactionFailed && <IconFailed />}
              </Col>
            </Row>
          </div>
        );
      }),
    [transactions, chainId],
  );

  const downloadTransactionReport = useMemo(() => {
    return (
      <DownloadTransactionReport
        transactions={transactions}
        receipts={[...Object.values(successReceipts), ...Object.values(failedReceipts)]}
        tokenInfo={tokenInfo}
      />
    );
  }, [transactions, successReceipts, failedReceipts, tokenInfo]);

  const handleGoBack = () => {
    if (hasReport) {
      const promtGoBack = confirm(t('send_token.confirm_go_back'));

      if (!promtGoBack) {
        return;
      }
    }

    setListAddress([]);
    setTokenInfo(null);
    navigate(STEPS.PREPARE)();
  };

  useEffect(() => {
    //Has done some transactions and has report download button
    if (transactionsStatus && transactionsStatus !== TRANSACTION_STATUS.ALL_FAILED) {
      dispatch(setHasReport(true));
    }

    return () => {
      dispatch(setHasReport(false));
    };
  }, [transactionsStatus]);

  return (
    <div className="send-token">
      {isLoading && !isConnectingBrowserWallet && (
        <>
          <LoadingComponent spinning={true} size={68} />
          <Paragraph>{t('send_token.confirm_transaction')}</Paragraph>
        </>
      )}

      <div className="send-token__transaction__wrapper">
        {errorMessage && (
          <div className="error-message">
            <IconWarningOutline />
            {t(errorMessage)}
          </div>
        )}
        {!isLoading && transactionsStatus && (
          <div
            className={cx('error-message', {
              success: transactionsStatus === TRANSACTION_STATUS.ALL_FINISHED,
              failed: transactionsStatus === TRANSACTION_STATUS.ALL_FAILED,
              warning: transactionsStatus === TRANSACTION_STATUS.SOME_FAILED,
            })}
          >
            {transactionsStatus === TRANSACTION_STATUS.ALL_FINISHED && <IconSuccess />}
            {transactionsStatus === TRANSACTION_STATUS.ALL_FAILED && <IconError />}
            {transactionsStatus === TRANSACTION_STATUS.SOME_FAILED && <IconExclaimable />}
            {t(TRANSACTION_STATUS_MESSAGE[transactionsStatus])}
          </div>
        )}

        {!isLoading && transactionsDetail}

        {transactionsStatus === TRANSACTION_STATUS.SOME_FAILED && (
          <div className="send-token__retry" onClick={retryTransaction()}>
            {t('send_token.retry')} <IconArrowRight />
          </div>
        )}

        {!isLoading && (
          <Row
            gutter={[16, 16]}
            align="middle"
            justify={
              transactionsStatus && transactionsStatus !== TRANSACTION_STATUS.ALL_FAILED ? 'space-between' : 'start'
            }
          >
            <Col>
              {!(transactionsStatus && transactionsStatus !== TRANSACTION_STATUS.ALL_FAILED) && (
                <AppButton
                  variant="secondary"
                  text={t('common.back')}
                  onClick={
                    transactionsStatus && transactionsStatus === TRANSACTION_STATUS.ALL_FAILED
                      ? retryTransaction(STEPS.SUMMARY)
                      : navigate(STEPS.SUMMARY)
                  }
                />
              )}

              {transactionsStatus && transactionsStatus !== TRANSACTION_STATUS.ALL_FAILED && downloadTransactionReport}
            </Col>
            <Col>
              {transactionsStatus && transactionsStatus !== TRANSACTION_STATUS.ALL_FAILED && (
                <div className="send-token__retry" onClick={handleGoBack} style={{ marginTop: 0 }}>
                  {t('send_token.new_transaction')} <IconArrowRight />
                </div>
              )}
              {transactionsStatus && transactionsStatus === TRANSACTION_STATUS.ALL_FAILED && (
                <AppButton text={t('common.try_again')} onClick={retryTransaction()} />
              )}
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default memo(SendToken);
