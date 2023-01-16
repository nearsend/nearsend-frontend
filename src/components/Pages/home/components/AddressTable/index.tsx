import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';

import BoundedNumberFormat from 'components/BoundedNumberFormat';
import { FORMAT_DECIMAL_SCALE } from 'services/WalletService/constants';

import TableCommon from 'components/Table';

const { Paragraph } = Typography;

type AddressTable = {
  tokenSymbol: any;
  listAddress: any[];
};

const AddressTable: FC<AddressTable> = ({ tokenSymbol, listAddress }) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('common.no'),
      dataIndex: 'no',
      width: '15%',
    },
    {
      title: t('common.address'),
      dataIndex: 'address',
      width: '60%',
      render: (address: string) => <Paragraph>{address}</Paragraph>,
    },
    {
      title: <div style={{ textAlign: 'right' }}>{t('common.amount')}</div>,
      dataIndex: 'amount',
      width: '25%',
      render: (amount: string) => (
        <div style={{ textAlign: 'right' }}>
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
  ];

  return (
    <TableCommon
      showPagination={false}
      total={listAddress?.length}
      dataSource={listAddress}
      columns={columns}
      rowKey="address"
      className="address-table"
      scroll={{ y: 380 }}
    />
  );
};

export default memo(AddressTable);
