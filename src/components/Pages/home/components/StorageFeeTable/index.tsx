import { FC, Key, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Space, Table } from 'antd';

import BoundedNumberFormat from 'components/BoundedNumberFormat';
import { FORMAT_DECIMAL_SCALE } from 'services/WalletService/constants';
import IconHelp from 'resources/svg/IconHelp';
import IconError from 'resources/svg/IconError';
import IconChecked from 'resources/svg/IconChecked';
import TableCommon from 'components/Table';
import NumberFormat from 'components/NumberFormat';
import TooltipComponent from 'components/Tooltip';

const { Paragraph, Title } = Typography;

type StorageFeeTable = {
  tokenSymbol: any;
  storageFeeList: any[];
  listAddressToSend: any[];
  setListAddressToSend: (listAddress: any[]) => void;
  listAddressId: string;
  updateListAddress: (id: string, listAddress: any[]) => Promise<void>;
};

const StorageFeeTable: FC<StorageFeeTable> = ({
  tokenSymbol,
  storageFeeList,
  listAddressToSend,
  setListAddressToSend,
  listAddressId,
  updateListAddress,
}) => {
  const { t } = useTranslation();

  const [selectedRowsLength, setSelectedRowsLength] = useState(0);

  useEffect(() => {
    let selectedRowsLength = 0;

    if (storageFeeList?.length > 0) {
      const storageFeeSet = new Set();

      for (const storageFee of storageFeeList) {
        storageFeeSet.add(storageFee?.address);
      }

      for (const addressToSend of listAddressToSend) {
        if (storageFeeSet.has(addressToSend?.address)) {
          selectedRowsLength += 1;
        }
      }
    }

    setSelectedRowsLength(selectedRowsLength);
  }, [listAddressToSend, storageFeeList]);

  const columns = [
    Table.SELECTION_COLUMN,
    {
      title: (
        <>
          <NumberFormat displayType="text" thousandSeparator value={selectedRowsLength} />
          &nbsp;{t('common.of')}&nbsp;
          <NumberFormat displayType="text" thousandSeparator value={storageFeeList?.length || 0} />{' '}
          {t('common.selected')}
        </>
      ),
      dataIndex: 'address',
      width: '50%',
      render: (address: string) => <Paragraph>{address}</Paragraph>,
    },
    {
      title: t('common.amount'),
      dataIndex: 'amount',
      width: '25%',
      render: (amount: string) => (
        <div>
          <BoundedNumberFormat
            displayType="text"
            thousandSeparator
            value={amount}
            decimalScale={FORMAT_DECIMAL_SCALE}
          />
          <span className="suffix"> {tokenSymbol}</span>
        </div>
      ),
    },
    {
      title: (
        <TooltipComponent
          title={
            <>
              <Title level={5}>{t('common.status')}</Title>
              <Space size={2}>
                <IconChecked /> {t('send_token.storage_registered')}
              </Space>
              <Space size={2}>
                <IconError /> {t('send_token.storage_unregistered')}
              </Space>
            </>
          }
          style={{ textAlign: 'center', display: 'block' }}
        >
          <span>
            {t('common.status')}&nbsp;
            <IconHelp />
          </span>
        </TooltipComponent>
      ),
      dataIndex: 'storageFeeNeed',
      width: '15%',
      render: (storageFeeNeed: number) => (
        <div style={{ textAlign: 'center' }}>{!!storageFeeNeed ? <IconError /> : <IconChecked />}</div>
      ),
    },
  ];

  const onChangeSelectRow = (selectedRowKeys: Key[], selectedRows: any[]) => {
    setListAddressToSend(selectedRows);
    updateListAddress(listAddressId, selectedRows);
  };

  return (
    <TableCommon
      className="storage-table"
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys: listAddressToSend?.map(({ address = '' }) => address),
        onChange: onChangeSelectRow,
        preserveSelectedRowKeys: true,
      }}
      showPagination={false}
      total={storageFeeList?.length}
      dataSource={storageFeeList}
      columns={columns}
      rowKey="address"
      scroll={{ y: 380 }}
    />
  );
};

export default memo(StorageFeeTable);
