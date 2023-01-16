import { FC } from 'react';

import NumberFormat from 'components/NumberFormat';
import { greaterThan } from 'services/WalletService/utils/number';

type BoundedNumberFormatProps = {
  minValue?: number;
  [x: string]: any;
};

const MIN_VALUE = 0.00000001;

const BoundedNumberFormat: FC<BoundedNumberFormatProps> = ({ minValue = MIN_VALUE, value, ...props }) => {
  return greaterThan(value, 0) && greaterThan(minValue, value) ? (
    <NumberFormat {...props} value={minValue} prefix="< " />
  ) : (
    <NumberFormat {...props} value={value} />
  );
};

export default BoundedNumberFormat;
