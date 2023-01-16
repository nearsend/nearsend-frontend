import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { ExecutionOutcomeWithIdView } from 'near-api-js/lib/providers/provider';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';

import { COLUMN_HEADERS } from '../../constant';
import AppButton from 'components/AppButton';
import DownloadExcelButton, { DEFAULT_ROW_ALIGN, DEFAULT_ROW_FONT } from 'components/DownloadExcelButton';
import { NATIVE_TOKEN } from 'connectors/constants';
import useGetBlockData from 'hooks/blockchainHook/useGetBlockData';
import { formatDateRequest } from 'utils/date';
import {
  formatNearAmount,
  getSendFtTokenParamsFromReceipt,
  getSendNEARAmountFromReceipt,
} from 'services/WalletService/utils/nearUtils';

const DownloadTransactionReport: FC<{
  transactions: [string, Record<'Success' | 'Failure', Record<string, ExecutionOutcomeWithIdView>>][];
  receipts: any[];
  tokenInfo: any;
}> = ({ transactions, receipts, tokenInfo }) => {
  const { t } = useTranslation();

  const [reportTransactions, setReportTransactions] = useState<Record<string, ExecutionOutcomeWithIdView>>({});
  const [blockHashes, setBlockHashes] = useState<string[]>([]);
  const [blockTimeData, setBlockTimeData] = useState<any>({});

  const downloadCsvRef = useRef<any>(null);

  const { getBlockData } = useGetBlockData();

  useEffect(() => {
    let reportTransactions: Record<string, ExecutionOutcomeWithIdView> = {};
    const blockHashes: string[] = [];

    for (const [hash, { Failure, Success }] of transactions) {
      reportTransactions = { ...reportTransactions, ...Failure, ...Success };
    }

    for (const transaction of Object.values(reportTransactions)) {
      blockHashes.push(transaction?.block_hash);
    }

    setReportTransactions(reportTransactions);
    setBlockHashes(blockHashes);
  }, [transactions]);

  useEffect(() => {
    if (blockHashes?.length > 0) {
      (async () => {
        const blockData = (await getBlockData(blockHashes)) || [];
        const blockTimeData: any = {};

        for (const block of blockData) {
          if (block?.header?.hash) {
            blockTimeData[block?.header?.hash] = Math.floor((block?.header?.timestamp || 0) / 1000000);
          }
        }
        setBlockTimeData(blockTimeData);
      })();
    }
  }, [blockHashes]);

  const excelBtnProps = useMemo(() => {
    const tableData: any[] = [];
    let sender = '',
      txTime: string | null = '',
      txTimeTitle: string | null = '';

    if (tokenInfo?.value === NATIVE_TOKEN) {
      for (const [i, receipt] of receipts.entries()) {
        sender = get(receipt, ['receipt', 'Action', 'signer_id']);
        txTime = formatDateRequest(get(blockTimeData, get(reportTransactions, [receipt?.receipt_id, 'block_hash'])));
        txTimeTitle = formatDateRequest(
          get(blockTimeData, get(reportTransactions, [receipt?.receipt_id, 'block_hash'])),
          'DDMMyyyy_HHmmss',
        );

        tableData.push({
          no: i + 1,
          txTime,
          txHash: get(reportTransactions, [receipt?.receipt_id, 'hash']),
          sender,
          smartContract: receipt?.predecessor_id,
          recipient: receipt?.receiver_id,
          amount: getSendNEARAmountFromReceipt(receipt),
          tokenTicker: NATIVE_TOKEN,
          tokenAddress: NATIVE_TOKEN,
          status: get(reportTransactions, [receipt?.receipt_id, 'outcome', 'status'])?.hasOwnProperty('Failure')
            ? t('common.failure')
            : t('common.success'),
          gasFee:
            formatNearAmount(get(reportTransactions, [receipt?.receipt_id, 'outcome', 'gas_burnt'])?.toString()) +
            ` ${NATIVE_TOKEN}`,
        });
      }
    } else {
      for (const [i, receipt] of receipts.entries()) {
        //If receipt end with ft_on_transfer => Send failed. If receipt end with ft_transfer => Send success
        const isFtOnTransferEvent =
          get(receipt, ['receipt', 'Action', 'actions', '0', 'FunctionCall', 'method_name']) === 'ft_on_transfer';
        const { address, amount } = getSendFtTokenParamsFromReceipt(receipt, tokenInfo) || {};
        sender = get(receipt, ['receipt', 'Action', 'signer_id']);
        txTime = formatDateRequest(get(blockTimeData, get(reportTransactions, [receipt?.receipt_id, 'block_hash'])));
        txTimeTitle = formatDateRequest(
          get(blockTimeData, get(reportTransactions, [receipt?.receipt_id, 'block_hash'])),
          'DDMMyyyy_HHmmss',
        );

        tableData.push({
          no: i + 1,
          txTime,
          txHash: get(reportTransactions, [receipt?.receipt_id, 'hash']),
          sender,
          smartContract: isFtOnTransferEvent ? receipt?.receiver_id : receipt?.predecessor_id,
          recipient: address,
          amount,
          tokenTicker: tokenInfo?.symbol,
          tokenAddress: isFtOnTransferEvent ? receipt?.predecessor_id : receipt?.receiver_id,
          status: get(reportTransactions, [receipt?.receipt_id, 'outcome', 'status'])?.hasOwnProperty('Failure')
            ? t('common.failure')
            : t('common.success'),
          gasFee:
            formatNearAmount(get(reportTransactions, [receipt?.receipt_id, 'outcome', 'gas_burnt'])?.toString()) +
            ` ${NATIVE_TOKEN}`,
        });
      }
    }

    return {
      workBookName: `nearsend_${txTimeTitle}_${sender}`,
      sheetTitle: '',
      columnHeaders: COLUMN_HEADERS.map(({ title, ...rest }) => ({
        title: t(title),
        ...rest,
      })),
      metaData: [],
      tableData,
      rowFont: COLUMN_HEADERS.map(() => ({
        font: { ...DEFAULT_ROW_FONT },
        alignment: { ...DEFAULT_ROW_ALIGN },
      })),
      rowStyle: {
        font: { ...DEFAULT_ROW_FONT, bold: true },
      },
    };
  }, [reportTransactions, receipts, tokenInfo, blockTimeData]);

  const downloadFile = debounce(() => {
    downloadCsvRef?.current?.createWorkbookFromParent();
  }, 500);

  return (
    <AppButton onClick={downloadFile}>
      <DownloadExcelButton
        ref={downloadCsvRef}
        label={t('send_token.download_report')}
        workSheetName=""
        showLogo={false}
        {...excelBtnProps}
      />
    </AppButton>
  );
};

export default DownloadTransactionReport;
