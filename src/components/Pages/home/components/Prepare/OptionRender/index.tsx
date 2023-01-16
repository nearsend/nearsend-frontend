import { FC } from 'react';
import cx from 'classnames';

import NumberFormat from 'components/NumberFormat';

type OptionRenderProps = {
  value: string;
  token: string;
  symbol: string;
  address: string;
  balance: string;
  icon: string;
};

// const MAX_CHARACTER_TOKEN = 30;
// const MAX_CHARACTER_ADDRESS = 10;

// const truncateString = (str: string, type: 'token' | 'address') => {
//   const len = str.length;
//   switch (type) {
//     case 'token': {
//       return len > MAX_CHARACTER_TOKEN ? `${str.slice(0, 10)}...${str.slice(len - 10, len - 1)}` : str;
//     }
//     case 'address': {
//       return len > MAX_CHARACTER_ADDRESS ? `${str.slice(0, 10)}...` : str;
//     }
//     default:
//       return str;
//   }
// };

const OptionRender: FC<OptionRenderProps> = ({ token, address, symbol, balance, icon }) => {
  return (
    <div className={cx('option-render__wrapper')}>
      <div className={cx('option-render__logo')}>
        <img src={icon} alt="" />
      </div>
      <div className="option-render__content">
        <div className={cx('option-render__title')}>
          <div className={cx('option-render__token')}>
            <span className={cx('option-render__token--bold')}>{token}</span>
            &nbsp; ({symbol})
          </div>
          <span className={cx('option-render__address')}>{address}</span>
        </div>
        <div className={cx('option-render__balance')}>
          <NumberFormat decimalScale={4} displayType="text" value={balance} thousandSeparator suffix={` ${symbol}`} />
        </div>
      </div>
    </div>
  );
};
export default OptionRender;
