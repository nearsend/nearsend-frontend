import { FC, useMemo, useState, useEffect, memo } from 'react';
import { Col, Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import isEmpty from 'lodash/isEmpty';
import cx from 'classnames';

import { NATIVE_TOKEN } from 'connectors/constants';
import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import selectBalance from 'store/balance/selector';
import useGetBalance from 'hooks/blockchainHook/useGetBalance';
import AppButton from 'components/AppButton';
import { addValue, greaterThanOrEqualTo, multiplyValue } from 'services/WalletService/utils/number';
import { FORMAT_4_DECIMAL } from 'services/WalletService/constants';
import BoundedNumberFormat from 'components/BoundedNumberFormat';
import useGetGasPrice from 'hooks/blockchainHook/useGetGasPrice';
import IconWarningOutline from 'resources/svg/IconWarningOutline';
import { CHUNK_SIZE, useSendToken } from 'context/SendTokenContext';
import selectSendToken from 'store/sendToken/selector';
import { setErrorMessage } from 'store/sendToken/slice';
import useRefetchListAddress from 'hooks/layoutHook/useRefetchListAddress';

const { Title, Paragraph } = Typography;

type SummaryProps = {
  address: string;
  next: () => void;
  prev: () => void;
};

type Summary = {
  value: string | number | null;
  title: string;
  prefix?: string | null;
  suffix?: string | null;
  errorKey?: ERROR_KEY;
};

enum ERROR_KEY {
  TOKEN_BALANCE = 'TOKEN_BALANCE',
  NATIVE_TOKEN_BALANCE = 'NATIVE_TOKEN_BALANCE',
}

//Currently Fixed
const ESTIMATED_FEE = 300;
const yoctoNEAR = 0.000000000000000000000001;

const Summary: FC<SummaryProps> = ({ address, next, prev }) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  useRefetchListAddress();
  const { getBalance, getNativeTokenBalance, hasGetBalance } = useGetBalance();
  const { getGasPrice, hasGetGasPrice } = useGetGasPrice();

  const [totalToken, setTotalToken] = useState(0);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [errors, setErrors] = useState<any>({});
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [hasCheckForError, setHasCheckForError] = useState(false);

  const { listAddressToSend, totalTransactions, setTotalTransactions, tokenInfo } = useSendToken();

  const nativeTokenBalance = useAppSelector(selectBalance.getBalance(NATIVE_TOKEN));
  const selectedTokenBalance = useAppSelector(selectBalance.getBalance());
  const globalErrorMessage = useAppSelector(selectSendToken.getErrorMessage);

  const isSendingNEAR = tokenInfo?.value === NATIVE_TOKEN;

  useEffect(() => {
    setErrors({});
    setErrorMessages([]);

    return () => {
      dispatch(setErrorMessage(''));
    };
  }, []);

  useEffect(() => {
    const handleGetGasPrice = async () => {
      const gasPrice = await getGasPrice();

      if (isSendingNEAR) {
        getNativeTokenBalance();
      } else {
        getBalance(tokenInfo);
      }
      setEstimatedFee(
        addValue([
          multiplyValue([totalTransactions, yoctoNEAR]),
          multiplyValue([gasPrice, ESTIMATED_FEE, totalTransactions]),
        ]),
      );
    };

    if (!!address && listAddressToSend?.length > 0 && !isEmpty(tokenInfo) && totalTransactions) {
      handleGetGasPrice();
    }
  }, [address, listAddressToSend, tokenInfo?.address, totalTransactions]);

  const summaryData: (Summary | null)[] = useMemo(
    () =>
      [
        {
          value: listAddressToSend?.length,
          title: 'summary.total_address',
        },
        {
          value: totalTransactions,
          title: 'summary.total_transactions',
        },
        {
          value: estimatedFee,
          title: 'summary.approximate_cost',
          suffix: ` ${NATIVE_TOKEN}`,
        },
        {
          value: totalToken,
          title: 'summary.total_token',
          suffix: ` ${tokenInfo?.symbol || ''}`,
        },
        !isSendingNEAR
          ? {
              value: selectedTokenBalance,
              title: 'summary.total_balance',
              suffix: ` ${tokenInfo?.symbol || ''}`,
              prefix: null,
              errorKey: ERROR_KEY.TOKEN_BALANCE,
            }
          : null,
        {
          value: nativeTokenBalance,
          title: 'summary.your_near_balance',
          suffix: ` ${NATIVE_TOKEN}`,
          errorKey: ERROR_KEY.NATIVE_TOKEN_BALANCE,
        },
      ].filter(Boolean),
    [
      listAddressToSend,
      tokenInfo,
      nativeTokenBalance,
      selectedTokenBalance,
      estimatedFee,
      totalToken,
      totalTransactions,
    ],
  );

  useEffect(() => {
    let totalToken = 0;
    let totalTransactions = 0;

    if (listAddressToSend && listAddressToSend?.length > 0) {
      if (isSendingNEAR) {
        totalTransactions = Math.ceil(listAddressToSend?.length / CHUNK_SIZE.NATIVE_TOKEN);
      } else {
        totalTransactions = Math.ceil(listAddressToSend?.length / CHUNK_SIZE.FT_TOKEN);
      }

      totalToken = listAddressToSend.reduce((previousValue, currentValue) => {
        return addValue([previousValue, currentValue?.amount]);
      }, 0);

      setTotalTransactions(totalTransactions);
      setTotalToken(totalToken);
    }
  }, [listAddressToSend, tokenInfo]);

  useEffect(() => {
    setHasCheckForError(false);

    const validateSummary = () => {
      const errors: Record<string, string> = {};
      if (!isSendingNEAR && !greaterThanOrEqualTo(selectedTokenBalance, totalToken)) {
        errors[ERROR_KEY.TOKEN_BALANCE] = 'message.E8';
      }
      if (
        !greaterThanOrEqualTo(nativeTokenBalance, !isSendingNEAR ? estimatedFee : addValue([estimatedFee, totalToken]))
      ) {
        errors[ERROR_KEY.NATIVE_TOKEN_BALANCE] = 'message.E9';
      }
      return errors;
    };

    if (hasGetBalance && hasGetGasPrice) {
      const errors = validateSummary();
      setErrors(errors);
      setHasCheckForError(true);

      if (Object.keys(errors)?.length > 0) {
        setErrorMessages(Object.values(errors).map((errorMessage: string) => errorMessage));
      } else {
        setErrorMessages([]);
      }
    }
  }, [nativeTokenBalance, selectedTokenBalance, totalToken, estimatedFee, hasGetBalance, hasGetGasPrice]);

  const handleNextStep = () => {
    if (globalErrorMessage) {
      dispatch(setErrorMessage(''));
    }

    next();
  };

  return (
    <div className="summary">
      <Title level={5}>{t('summary.title')}</Title>

      <Row gutter={[16, 54]} className="summary__info">
        {summaryData.map((summary, index) => {
          const { value, title = '', prefix, suffix, errorKey } = summary || {};

          return (
            <Col
              key={index}
              sm={12}
              md={8}
              className={cx({
                error: errorKey && errors[errorKey],
              })}
            >
              <Paragraph>{t(title)}</Paragraph>
              <BoundedNumberFormat
                prefix={prefix}
                displayType="text"
                thousandSeparator
                value={value || 0}
                decimalScale={FORMAT_4_DECIMAL}
                minValue={0.0001}
              />
              <span className="suffix">{suffix}</span>
            </Col>
          );
        })}
      </Row>

      {errorMessages?.length > 0 &&
        errorMessages.map((errorMessage, index) => (
          <div key={index} className="summary__error error-message">
            <IconWarningOutline />
            {t(errorMessage)}
          </div>
        ))}
      {globalErrorMessage && (
        <div className="summary__error error-message">
          <IconWarningOutline />
          {t(globalErrorMessage)}
        </div>
      )}

      <Row className="button-group" gutter={[24, 16]}>
        <Col>
          <AppButton variant="secondary" text={t('common.back')} onClick={prev} />
        </Col>
        <Col>
          <AppButton
            disabled={Object.keys(errors)?.length > 0 || !hasCheckForError}
            text={t('common.send_transaction')}
            onClick={handleNextStep}
          />
        </Col>
      </Row>
    </div>
  );
};

export default memo(Summary);
