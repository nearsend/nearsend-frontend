import { useEffect, FC, useState, useRef, memo } from 'react';
import isEmpty from 'lodash/isEmpty';
import { Col, Form, Row, Typography } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';

import useGetGasPrice from 'hooks/blockchainHook/useGetGasPrice';
import StorageFeeTable from '../StorageFeeTable';
import AppButton from 'components/AppButton';
import BoundedNumberFormat from 'components/BoundedNumberFormat';
import { FORMAT_DECIMAL_SCALE } from 'services/WalletService/constants';
import { NATIVE_TOKEN } from 'connectors/constants';
import FormItem, { TYPE_INPUT } from 'components/FormItem';
import LENGTH_CONSTANTS from 'constants/length';
import IconSearch from 'resources/svg/IconSearch';
import { addValue, convertToBigNumber, greaterThanOrEqualTo, multiplyValue } from 'services/WalletService/utils/number';
import useServiceFee from 'hooks/blockchainHook/useServiceFee';
import useGetBalance from 'hooks/blockchainHook/useGetBalance';
import IconWarningOutline from 'resources/svg/IconWarningOutline';
import { useSendToken } from 'context/SendTokenContext';
import IconArrowDown from 'resources/svg/IconArrowDown';
import IconHelp from 'resources/svg/IconHelp';
import useListAddress from 'hooks/layoutHook/useListAddress';
import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import selectSendToken from 'store/sendToken/selector';
import { setErrorMessage as setGlobalErrorMessage, setTransactionHashes } from 'store/sendToken/slice';
import TooltipComponent from 'components/Tooltip';
import useWindowSize from 'hooks/useWindowSize';
import { MAX_MOBILE_WIDTH } from 'constants/index';
import LoadingComponent from 'components/Loading';

const { Paragraph, Title } = Typography;

type SetupTokenAccountsProps = {
  listAddress: any[];
  address: string;
  next: () => void;
  prev: () => void;
  hasDuplicatedAddress: boolean;
};

enum OPTIONS {
  ALL_ADDRESS = 1,
  UNREGISTERED_ADDRESS = 2,
  REGISTERED_ADDRESS = 3,
}

const filterAddressOptions = [
  {
    name: 'send_token.allAddress',
    value: OPTIONS.ALL_ADDRESS,
  },
  {
    name: 'send_token.unregisteredAddress',
    value: OPTIONS.UNREGISTERED_ADDRESS,
  },
  {
    name: 'send_token.registeredAddress',
    value: OPTIONS.REGISTERED_ADDRESS,
  },
];

const SetupTokenAccounts: FC<SetupTokenAccountsProps> = ({
  address,
  listAddress,
  next,
  prev,
  hasDuplicatedAddress,
}) => {
  const { t } = useTranslation();

  const formikRef = useRef<any>(null);
  const { width }: any = useWindowSize();

  const dispatch = useAppDispatch();

  const [storageFeeList, setStorageFeeList] = useState<any[]>([]);
  const [storageFeeListUnfiltered, setStorageFeeListUnfiltered] = useState<any[]>([]);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [minStorageFee, setMinStorageFee] = useState(0);
  const [listAddressNeedStorageFee, setListAddressNeedStorageFee] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [retry, setRetry] = useState(false);
  const [retryTransactions, setRetryTransactions] = useState<any[]>([]);
  const [countAccountNeedStorageFee, setCountAccountNeedStorageFee] = useState(0);
  const [appContractStorageFeeNeed, setAppContractStorageFeeNeed] = useState(0);
  const [isShowListTable, setIsShowListTable] = useState(false);
  const [isBackFromNearWallet, setIsBackFromNearWallet] = useState(false);

  const transactionHashes = useAppSelector(selectSendToken.getTransactionHashes);
  const globalErrorMessage = useAppSelector(selectSendToken.getErrorMessage);

  const { getStorageFee, currentProgress } = useGetGasPrice();
  const { getNativeTokenBalance } = useGetBalance();
  const { listAddressToSend, setListAddressToSend, tokenInfo, setListAddress } = useSendToken();
  const { getServiceFee, payForServiceFee, isProcessing, totalServiceFee, totalAccountPayingFor } = useServiceFee(
    listAddressToSend?.length,
  );
  const {
    getListAddress,
    createListAddress,
    updateListAddress,
    listAddressId,
    fetched: hasFetchedListAddress,
    listAddress: savedListAddress,
  } = useListAddress();

  useEffect(() => {
    (async () => {
      await getListAddress();
    })();

    return () => {
      dispatch(setGlobalErrorMessage(''));
    };
  }, []);

  useEffect(() => {
    if (transactionHashes?.length > 0) {
      setIsBackFromNearWallet(true);
      dispatch(setTransactionHashes([]));
    }
  }, [transactionHashes]);

  useEffect(() => {
    if (
      isBackFromNearWallet &&
      listAddress?.length > 0 &&
      listAddressNeedStorageFee?.length === 0 &&
      convertToBigNumber(totalServiceFee).toNumber() === 0
    ) {
      next();
    }
  }, [isBackFromNearWallet, listAddressNeedStorageFee, listAddress, totalServiceFee]);

  useEffect(() => {
    if (hasFetchedListAddress) {
      (async () => {
        if (listAddress?.length === 0 && savedListAddress?.length > 0) {
          setListAddress(savedListAddress);
          return;
        } else if (listAddress?.length > 0) {
          if (!listAddressId && listAddress?.length > 0) {
            await createListAddress(listAddress);
          } else if (listAddressId) {
            await updateListAddress(listAddressId, listAddress);
          }
        }
      })();
    }
  }, [hasFetchedListAddress, listAddressId, savedListAddress, listAddress]);

  useEffect(() => {
    if (!!address && !isEmpty(tokenInfo) && listAddress?.length > 0) {
      (async () => {
        const {
          storageFeeList = [],
          minStorageFee = 0,
          appContractStorageFeeNeed = 0,
        } = (await getStorageFee(listAddress, tokenInfo?.address)) || {};

        const mergedStorageFeeList = storageFeeList.map((data, index) => ({
          key: data?.address,
          ...data,
          ...listAddress[index],
        }));

        setStorageFeeList(mergedStorageFeeList);
        setStorageFeeListUnfiltered(mergedStorageFeeList);
        setListAddressToSend(mergedStorageFeeList);
        setMinStorageFee(minStorageFee);
        setAppContractStorageFeeNeed(appContractStorageFeeNeed);
      })();
    }
  }, [address, listAddress, tokenInfo?.address]);

  useEffect(() => {
    if (!!address) {
      (async () => {
        await getServiceFee();
      })();
    }
  }, [address, listAddressToSend]);

  useEffect(() => {
    if (listAddressToSend?.length === 0) {
      setErrorMessage('message.E19');
    } else {
      setErrorMessage('');
    }
  }, [listAddressToSend]);

  useEffect(() => {
    if (listAddressToSend?.length > 0) {
      const listAddressNeedStorageFee = listAddressToSend.filter(({ storageFeeNeed }) => !!storageFeeNeed);

      setListAddressNeedStorageFee(listAddressNeedStorageFee);
      setEstimatedFee(
        addValue([
          multiplyValue([minStorageFee, listAddressNeedStorageFee?.length]),
          totalServiceFee,
          appContractStorageFeeNeed,
        ]),
      );
    } else {
      setListAddressNeedStorageFee([]);
      setEstimatedFee(0);
    }
  }, [minStorageFee, listAddressToSend, totalServiceFee, appContractStorageFeeNeed]);

  useEffect(() => {
    setCountAccountNeedStorageFee(
      storageFeeListUnfiltered.filter(({ storageFeeNeed }) => !!Number(storageFeeNeed))?.length || 0,
    );
  }, [storageFeeListUnfiltered]);

  useEffect(() => {
    if (
      (listAddress?.length > 0 && currentProgress === 100) ||
      (savedListAddress?.length === 0 && hasFetchedListAddress)
    ) {
      setTimeout(() => {
        setIsShowListTable(true);
      }, 500);
    }
  }, [listAddress?.length, currentProgress, hasFetchedListAddress, savedListAddress?.length]);

  const handleRetryTransaction = () => {
    handleConfirmSetupAccounts(() => payForServiceFee({ retryTransactions }));
  };

  const handleSetupAccounts = () => {
    handleConfirmSetupAccounts(() =>
      payForServiceFee({
        serviceFee: totalServiceFee,
        listAddressNeedStorageFee,
        totalAccountPayingFor,
        tokenContract: tokenInfo?.address,
        appContractStorageFeeNeed,
      }),
    );
  };

  const handleConfirmSetupAccounts = async (executeTransaction: any) => {
    setErrorMessage('');
    setRetry(false);
    setRetryTransactions([]);

    const balance = (await getNativeTokenBalance()) || 0;
    if (!greaterThanOrEqualTo(balance, estimatedFee)) {
      setErrorMessage('message.E9');
      return;
    }

    const {
      transactionsSuccessStatus = false,
      errorMessage = '',
      failedTransactions,
      successTransactions,
    } = (await executeTransaction()) || {};

    if (transactionsSuccessStatus) {
      next();
    } else {
      if (errorMessage) {
        setRetry(true);
        setErrorMessage(errorMessage);
      }
    }

    if (successTransactions?.length) {
      const successAddress: Record<string, boolean> = {};

      successTransactions.map((transaction: any) => {
        if (transaction?.actions[0]?.params?.args?.account_id) {
          successAddress[transaction?.actions[0]?.params?.args?.account_id] = true;
        }
      });

      const newStorageFee = cloneDeep(storageFeeList).map(({ storageFeeNeed, address, ...data }) => ({
        storageFeeNeed: successAddress[address] ? 0 : storageFeeNeed,
        address,
        ...data,
      }));

      setStorageFeeList(newStorageFee);
    }

    if (failedTransactions?.length) {
      setRetryTransactions(failedTransactions);
    }
  };

  const onSearch = (setFieldValue: any, values: any) => () => {
    setFieldValue('filterAddress', values?.filterAddress?.trim());

    handleFilter({ filterType: values?.filterType, filterAddress: values?.filterAddress?.trim() });
  };

  const handleFilter = (values: any) => {
    const { filterType, filterAddress } = values || {};
    let storageFeeList = [];

    switch (filterType) {
      case OPTIONS.ALL_ADDRESS: {
        storageFeeList = filterAddress
          ? storageFeeListUnfiltered.filter(({ address }) =>
              address?.toLowerCase()?.includes(filterAddress?.toLowerCase()),
            )
          : storageFeeListUnfiltered;
        break;
      }
      case OPTIONS.REGISTERED_ADDRESS: {
        storageFeeList = filterAddress
          ? storageFeeListUnfiltered.filter(
              ({ address, storageFeeNeed }) =>
                address?.toLowerCase()?.includes(filterAddress?.toLowerCase()) && Number(storageFeeNeed) === 0,
            )
          : storageFeeListUnfiltered.filter(({ storageFeeNeed }) => Number(storageFeeNeed) === 0);
        break;
      }
      case OPTIONS.UNREGISTERED_ADDRESS: {
        storageFeeList = filterAddress
          ? storageFeeListUnfiltered.filter(
              ({ address, storageFeeNeed }) =>
                address?.toLowerCase()?.includes(filterAddress?.toLowerCase()) && Number(storageFeeNeed) !== 0,
            )
          : storageFeeListUnfiltered.filter(({ storageFeeNeed }) => Number(storageFeeNeed) !== 0);
        break;
      }
    }

    setStorageFeeList(storageFeeList);
  };

  const onSubmit = () => {};

  const handleSetFilter = (setFieldValue: any, values: any) => (e: any) => {
    const selectedOption = e?.val;
    setFieldValue('filterType', selectedOption);

    handleFilter({ filterType: selectedOption, filterAddress: values?.filterAddress });
  };

  return (
    <>
      {isShowListTable && (
        <Paragraph className="setup-accounts__notice">
          {countAccountNeedStorageFee
            ? t('send_token.notice_storage_fee_need')
            : t('send_token.notice_no_storage_fee_need')}
        </Paragraph>
      )}
      <div className="setup-accounts">
        {((currentProgress !== 100 && listAddress?.length > 0) || !isShowListTable) && (
          <Paragraph className="setup-accounts__checking-addresses">
            <LoadingComponent spinning={true} size={20} />
            {t('send_token.check_address')}:{' '}
            <span>
              <BoundedNumberFormat
                displayType="text"
                thousandSeparator
                value={(listAddress.length * currentProgress) / 100 || 0}
                decimalScale={0}
              />{' '}
              / <BoundedNumberFormat displayType="text" thousandSeparator value={listAddress?.length || 0} />
            </span>
          </Paragraph>
        )}

        {isShowListTable && (
          <>
            <Formik
              innerRef={formikRef}
              initialValues={{ filterType: OPTIONS.ALL_ADDRESS, filterAddress: '' }}
              onSubmit={onSubmit}
            >
              {({ setFieldValue, values }) => (
                <Form autoComplete="off">
                  <Row className="filter" gutter={[24, 24]} justify="space-between">
                    {width > MAX_MOBILE_WIDTH && (
                      <Col span={7}>
                        <FormItem
                          name="filterType"
                          options={filterAddressOptions}
                          typeInput={TYPE_INPUT.SELECT}
                          placeholder={t('common.select_token')}
                          suffixIcon={<IconArrowDown />}
                          onChange={handleSetFilter(setFieldValue, values)}
                          containerClassName="mb-0"
                        />
                        <TooltipComponent
                          title={
                            <>
                              <Title level={5}>{t('send_token.storage_registration')}</Title>
                              {t('send_token.storage_registration_desc')}
                            </>
                          }
                        >
                          {t('send_token.storage_registration')}&nbsp;
                          <IconHelp />
                        </TooltipComponent>
                      </Col>
                    )}
                    <Col span={17} xs={24} sm={17}>
                      <FormItem
                        name="filterAddress"
                        placeholder={t('send_token.search_address')}
                        maxLength={LENGTH_CONSTANTS.MAX_LENGTH_INPUT}
                        typeInput={TYPE_INPUT.SEARCH}
                        enterButton={<IconSearch />}
                        onBlur={onSearch(setFieldValue, values)}
                        onSearch={onSearch(setFieldValue, values)}
                      />
                    </Col>
                    {width <= MAX_MOBILE_WIDTH && (
                      <Col xs={24} sm={7}>
                        <FormItem
                          name="filterType"
                          options={filterAddressOptions}
                          typeInput={TYPE_INPUT.SELECT}
                          placeholder={t('common.select_token')}
                          suffixIcon={<IconArrowDown />}
                          onChange={handleSetFilter(setFieldValue, values)}
                          containerClassName="mb-0"
                        />
                        <TooltipComponent
                          title={
                            <>
                              <Title level={5}>{t('send_token.storage_registration')}</Title>
                              {t('send_token.storage_registration_desc')}
                            </>
                          }
                        >
                          {t('send_token.storage_registration')}&nbsp;
                          <IconHelp />
                        </TooltipComponent>
                      </Col>
                    )}
                  </Row>
                  {hasDuplicatedAddress && (
                    <Paragraph className="setup-accounts__dulicate">
                      {t('send_token.note_handle_duplicate_address')}
                    </Paragraph>
                  )}
                </Form>
              )}
            </Formik>

            <StorageFeeTable
              tokenSymbol={tokenInfo?.symbol}
              storageFeeList={storageFeeList}
              listAddressToSend={listAddressToSend}
              setListAddressToSend={setListAddressToSend}
              listAddressId={listAddressId}
              updateListAddress={updateListAddress}
            />

            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col>
                <Paragraph className="text-detail">
                  {t('send_token.total_selected_address')}:{' '}
                  <BoundedNumberFormat displayType="text" thousandSeparator value={listAddressToSend?.length || 0} />
                </Paragraph>
              </Col>
              <Col>
                <Paragraph className="text-detail">
                  {t('common.estimated_fee')}:{' '}
                  <BoundedNumberFormat
                    displayType="text"
                    thousandSeparator
                    value={estimatedFee || 0}
                    decimalScale={FORMAT_DECIMAL_SCALE}
                    suffix={` ${NATIVE_TOKEN}`}
                  />
                </Paragraph>
              </Col>
            </Row>

            {globalErrorMessage && (
              <div className="error-message">
                <IconWarningOutline />
                {t(globalErrorMessage)}
              </div>
            )}
            {errorMessage && (
              <div className="error-message">
                <IconWarningOutline />
                {t(errorMessage)}
              </div>
            )}
          </>
        )}

        <Row className="button-group" gutter={[24, 16]}>
          <Col>
            <AppButton variant="secondary" text={t('common.back')} onClick={prev} />
          </Col>
          <Col>
            {isShowListTable &&
              listAddress?.length > 0 &&
              (retry ? (
                <AppButton
                  loading={isProcessing}
                  text={t('send_token.confirm')}
                  onClick={handleRetryTransaction}
                  disabled={listAddressToSend?.length === 0}
                />
              ) : (
                <AppButton
                  loading={isProcessing}
                  text={t('send_token.confirm')}
                  onClick={handleSetupAccounts}
                  disabled={listAddressToSend?.length === 0}
                />
              ))}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default memo(SetupTokenAccounts);
