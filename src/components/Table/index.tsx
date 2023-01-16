import { FC } from 'react';
import { Pagination, Table, Empty } from 'antd';
import { TablePaginationConfig } from 'antd/lib/table';
import {
  FilterValue,
  GetRowKey,
  SorterResult,
  TableCurrentDataSource,
  TableRowSelection,
} from 'antd/lib/table/interface';
import { useVT } from 'virtualizedtableforantd4';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

import { PAGE_SIZE_OPTIONS, PAGE_SIZE_DEFAULT } from '../../constants';
import IconEmpty from 'resources/svg/IconEmpty';

type TableProps = {
  columns?: any;
  dataSource?: readonly any[];
  current?: number;
  pageSize?: number;
  total?: number;
  rowClassName?: string;
  pageSizeOptions?: string[];
  tabType?: any;
  onChangeTable?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<any> | SorterResult<any>[],
    extra: TableCurrentDataSource<any>,
  ) => void;
  onChangePagination?: (pageNum: number, pageSize: number) => void;
  size?: SizeType;
  pagination?: false | TablePaginationConfig;
  bordered?: boolean;
  rowKey?: string | GetRowKey<any>;
  showPagination?: boolean;
  className?: string;
  scroll?: any;
  ref?: any;
  tableLayout?: any;
  wrapClassName?: string;
  noData?: string;
  rowSelection?: TableRowSelection<any> | undefined;
};

const TableCommon: FC<TableProps> = ({
  columns = [],
  dataSource = [],
  current = 0,
  pageSize = 0,
  total = 0,
  rowClassName = '',
  pageSizeOptions = [],
  onChangeTable,
  onChangePagination,
  size,
  showPagination = true,
  pagination,
  bordered,
  noData,
  ...props
}) => {
  const [vt] = useVT(() => ({ scroll: { y: 600 } }), []);

  return (
    <div className="table">
      <Table
        locale={{ emptyText: <Empty image={<IconEmpty />} description={noData} /> }}
        pagination={false}
        columns={columns}
        bordered={bordered}
        rowClassName={rowClassName}
        dataSource={dataSource}
        onChange={onChangeTable}
        size={size}
        showSorterTooltip={false}
        rowKey={(record: any) => record._id}
        scroll={scroll}
        components={vt}
        {...props}
      />
      {showPagination && current && (
        <div className="my-pagination">
          <Pagination
            size="small"
            total={total ? total : 1}
            current={current}
            onChange={onChangePagination}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            pageSize={pageSize ?? PAGE_SIZE_DEFAULT}
            showSizeChanger
          />
        </div>
      )}
    </div>
  );
};

export default TableCommon;
