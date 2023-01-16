import { convertToBigNumber } from 'services/WalletService/utils/number';
import { useTranslation } from 'react-i18next';
import { memo, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import Excel from 'exceljs';
import { Col, Row, Upload, Typography, Space } from 'antd';
import cx from 'classnames';
import { useLocation } from 'react-router-dom';
import { read, utils } from 'xlsx';

import FormItem, { TYPE_INPUT } from 'components/FormItem';
import NumberFormat from 'components/NumberFormat';
import TooltipsExample from 'components/Tooltips/Example';
import TooltipsExampleFile from 'components/Tooltips/ExampleFile';
import { NATIVE_TOKEN, NATIVE_TOKEN_DECIMAL_SCALE } from 'connectors/constants';
import { useSendToken } from 'context/SendTokenContext';
import useGetBalance from 'hooks/blockchainHook/useGetBalance';
import { useGetTokens } from 'hooks/blockchainHook/useGetTokens';
import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import { trimSpace, trimSpaceStartEnd } from 'utils/string';
import AutoLineTextArea from './AutoLineTextArea';
import ErrorMessage from './ErrorMessage';
import ListInvalidAccount from './ListInvalidAccount';
import OptionRender from './OptionRender';
import createPrepareSchema, {
  handleAtLeastOneAccounts,
  handleValidRecipients,
  PrepareFormValue,
  REGEX_ADDRESS,
} from './schemas';
import { ACCEPT_TYPES } from 'constants/fileTypes';
import ERROR_INPUT_ADDRESS from 'constants/error';
import LoadingComponent from 'components/Loading';
import IconArrowDown from 'resources/svg/IconArrowDown';
import IconClose from 'resources/svg/IconClose';
import IconEdit from 'resources/svg/IconEdit';
import IconUpload from 'resources/svg/IconUpload';
import IconDragUpload from 'resources/svg/IconDragUpload';
import AppButton from 'components/AppButton';
import selectSendToken from 'store/sendToken/selector';
import { setErrorMessage } from 'store/sendToken/slice';

const { Text } = Typography;
const { Dragger } = Upload;
const initialValues: PrepareFormValue = {
  tokenAddress: '',
  recipientsAmount: '',
};

const Prepare = ({ next }: { next: any }) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const location = useLocation();

  const textAreaRef = useRef<any>(null);
  const formikRef = useRef<any>(null);

  const [upload, setUpload] = useState<boolean>(false);
  const [countLine, setCountLine] = useState<number>(1);
  const [errorLines, setErrorLines] = useState<{ line: number; error: string }[]>([]);
  const [balance, setBalance] = useState<{ balance: any; suffix: string }>();
  const [decimals, setDecimals] = useState<any>('');
  const [options, setOptions] = useState<any>([]);
  const [currentValidToken, setCurrentValidToken] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [wrongFormat, setWrongFormat] = useState<boolean>(false);

  const { getOwnedTokens, ownedTokensInfo } = useGetTokens();
  const { getBalance, getNativeTokenBalance, isGettingBalance } = useGetBalance();

  const { address, chainId } = useAppSelector(selectedAddress.getAddress);
  const globalErrorMessage = useAppSelector(selectSendToken.getErrorMessage);

  const prepareSchema = createPrepareSchema({ setErrorLines, setCurrentValidToken, decimals, chainId, address });

  const { setTokenInfo, setListAddress, listAddress, tokenInfo } = useSendToken();

  useEffect(() => {
    const { resetState } = (location?.state as { resetState: boolean }) || {};

    if (resetState) {
      setListAddress([]);
      setTokenInfo(null);
    }
  }, [location.state]);

  useEffect(() => {
    if (globalErrorMessage) {
      dispatch(setErrorMessage(''));
    }
  }, []);

  useEffect(() => {
    if (listAddress?.length > 0) {
      if (!formikRef?.current?.values?.recipientsAmount?.trim()) {
        formikRef?.current?.setFieldValue(
          'recipientsAmount',
          listAddress.map(({ address, amount }) => `${address},${amount || ''}`)?.join('\n'),
        );
      }

      formikRef?.current?.setFieldValue('tokenAddress', tokenInfo?.value);
      setCountLine(listAddress?.length);
      setDecimals(tokenInfo?.decimals);
      setTokenInfo(tokenInfo);
      setCurrentValidToken(tokenInfo?.value);
    } else {
      formikRef?.current?.setFieldValue('recipientsAmount', '');
      formikRef?.current?.setFieldValue('tokenAddress', '');
      setCountLine(1);
      setDecimals('');
      setCurrentValidToken('');
      setTokenInfo(null);
    }

    getOwnedTokens();
  }, []);

  useEffect(() => {
    const getAllOptions = async () => {
      const responses = ownedTokensInfo.map(async (tokenInfo) => {
        const balance = await getBalance(tokenInfo);

        return {
          address: tokenInfo?.address,
          token: tokenInfo?.name,
          symbol: tokenInfo?.symbol,
          icon: tokenInfo?.icon,
          balance,
          value: tokenInfo?.address,
          decimals: tokenInfo?.decimals,
        };
      });

      const newOptions = await Promise.all(responses);

      setOptions((prevTokenInfo: any) => [...prevTokenInfo, ...newOptions]);
    };

    if (address && ownedTokensInfo?.length > 0) {
      getAllOptions();
    }
  }, [ownedTokensInfo, address]);

  useEffect(() => {
    const getNativeTokenInfo = async () => {
      await getNativeTokenBalance().then((res) => {
        const newOptions: any[] = [];

        newOptions.splice(0, 0, {
          value: NATIVE_TOKEN,
          token: 'Near',
          symbol: NATIVE_TOKEN,
          address: 'NEAR (NEAR)',
          icon: '/near_icon.svg',
          decimals: NATIVE_TOKEN_DECIMAL_SCALE,
          balance: res,
        });
        setOptions((prevTokenInfo: any) => [...prevTokenInfo, ...newOptions]);
      });
    };
    if (address) {
      getNativeTokenInfo();
    }
  }, [address]);

  useEffect(() => {
    const selectedToken = options.find((option: any) => option.value === currentValidToken);

    if (currentValidToken === NATIVE_TOKEN) {
      getNativeTokenBalance().then((res) => setBalance({ balance: res, suffix: selectedToken?.symbol }));
    } else {
      getBalance(selectedToken).then((res) => setBalance({ balance: res, suffix: selectedToken?.symbol }));
    }
  }, [currentValidToken, options]);

  const handleDataTextArea = (str: string) => {
    let recipientArray = str.split('\n');
    recipientArray = recipientArray.filter((recipient) => recipient !== '');

    return recipientArray?.map((recipient) => {
      const address = recipient.match(REGEX_ADDRESS)?.[0] as any;
      const amount = `${convertToBigNumber(recipient.split(address)?.[1].slice(1).replaceAll(' ', ''))}`;
      return { address, amount };
    });
  };

  const handleOnSubmit = (value: PrepareFormValue) => {
    const newValue = { ...value };
    newValue.tokenAddress = newValue.tokenAddress?.replaceAll(' ', '');
    const { resultString } = trimSpace(newValue.recipientsAmount);
    const data = handleDataTextArea(resultString);
    setListAddress(data);
    console.log(data);
    next();
  };

  const handleDeleteInvalidLines = (setFieldValue: any, values: any) => () => {
    let newValue = values?.recipientsAmount.split('\n') || [];
    errorLines.map((line) => {
      newValue.splice(line.line - 1, 1, '');
    });
    newValue = newValue.filter((item: string) => item !== '');
    const count = newValue.length;
    newValue = newValue.join('\n');
    setFieldValue('recipientsAmount', newValue);
    if (count > 1) setCountLine(count);
    else setCountLine(1);
    handleValidRecipients(newValue, setErrorLines, decimals, chainId, address);
  };

  const handleOnChange = (e: any) => {
    const { form, field, val } = e;
    form.setFieldValue(field.name, val);
    setDecimals(options.find((item: any) => item.value === val)?.decimals);
    setTokenInfo(options.find((item: any) => item.value === val));
  };

  const handleOnSearch = (value: string, setFieldValue: any) => {
    if (value && value.toLowerCase() === 'near') {
      setFieldValue('tokenAddress', NATIVE_TOKEN);
      setDecimals(options.find((item: any) => item.value === NATIVE_TOKEN)?.decimals);
    }
    if (value.length <= 256) {
      setSearchText(value);
    } else {
      setSearchText(value.slice(0, 256));
    }
  };

  const handleOnEnterKey = (e: any) => {
    if (e.code === 'Enter') {
    }
  };

  const handleClearInput = (setFieldValue: any, field: string) => () => {
    setFieldValue(field, '');
    setBalance(undefined);
    setDecimals('');
    setCurrentValidToken('');
  };

  const handleChangeUploadMethod = () => {
    setUpload(!upload);
  };

  const handleAfterReadFileContent = (
    setFieldValue: any,
    setTouched: any,
    touched: any,
    field: string,
    data: string,
  ) => {
    const { resultString, count } = trimSpace(data);
    setUpload(false);
    setFieldValue(field, resultString);
    if (count > 1) setCountLine(count);
    else setCountLine(1);
    if (!handleAtLeastOneAccounts(resultString)) {
      setTouched({ ...touched, recipientsAmount: true });
    } else {
      setTouched({ ...touched, recipientsAmount: false });
    }
    handleValidRecipients(resultString, setErrorLines, decimals, chainId, address);
  };

  const readFileContent = (file: any, field: string, setFieldValue: any, setTouched: any, touched: any) => {
    const { name: fileName } = file;
    const fileExt = fileName.slice(fileName.lastIndexOf('.') + 1, fileName.length);
    if (ACCEPT_TYPES.includes(fileExt)) {
      setWrongFormat(false);
      const reader = new FileReader();

      if (fileExt === 'xls') {
        reader.onload = (e: any) => {
          const data = e.target.result;
          const readedData = read(data, { type: 'binary' });
          const wsname = readedData.SheetNames[0];
          const ws = readedData.Sheets[wsname];
          const dataParse = utils.sheet_to_csv(ws);
          handleAfterReadFileContent(setFieldValue, setTouched, touched, field, dataParse);
        };
        reader.readAsBinaryString(file);
      } else if (fileExt === 'xlsx') {
        let mergeString = '';
        const wb = new Excel.Workbook();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          const buffer = reader.result;
          wb.xlsx.load(buffer as any).then((workbook) => {
            workbook.eachSheet((sheet) => {
              sheet.eachRow((row) => {
                mergeString += (row.values as any)[1] + '\n';
              });
            });
            handleAfterReadFileContent(setFieldValue, setTouched, touched, field, mergeString);
          });
        };
      } else {
        reader.onload = (e: any) => {
          const { result } = e.target;
          handleAfterReadFileContent(setFieldValue, setTouched, touched, field, result);
        };
        reader.readAsText(file);
      }
    } else {
      setWrongFormat(true);
    }
    return false;
  };

  const checkTouchSelect = (touched: any) => {
    return Object.keys(touched).some((item) => {
      return item.includes('rc_select');
    });
  };

  const handleTextAreaBlur = (handleBlur: any, setFieldValue: any, values: any) => (e: any) => {
    handleBlur(e);
    const { count, newStr } = trimSpaceStartEnd(values.recipientsAmount);
    if (count > 1) setCountLine(count);
    else setCountLine(1);
    setFieldValue('recipientsAmount', newStr);
  };

  return (
    <Row className={cx('prepare')}>
      <div className={cx('prepare__wrapper')}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleOnSubmit}
          validationSchema={prepareSchema}
          validateOnChange={false}
          validateOnBlur={false}
          innerRef={formikRef}
        >
          {({ setFieldValue, values, errors, touched, setTouched, handleBlur, handleChange }) => {
            return (
              <Form autoComplete="off">
                <div className={cx('prepare__form__wrapper')}>
                  <div className={cx('prepare__form__wrapper--address')}>
                    <Row justify="space-between" wrap={false}>
                      <Col>
                        <div className={cx('form-item__label')}>{t('prepare.label_address')}</div>
                      </Col>
                      <Col className="prepare__balance">
                        {balance?.balance && (
                          <Text ellipsis={true}>
                            {t('prepare.balance')}{' '}
                            <span className={cx('prepare__balance--bold')}>
                              <NumberFormat
                                displayType="text"
                                decimalScale={4}
                                value={balance.balance || 0}
                                thousandSeparator
                                suffix={` ${balance.suffix}`}
                              />
                            </span>
                          </Text>
                        )}
                      </Col>
                    </Row>
                    <div
                      className={cx('prepare__address__input', {
                        'prepare__address__input--error':
                          errors.tokenAddress && (touched.tokenAddress || checkTouchSelect(touched)),
                      })}
                    >
                      <FormItem
                        name="tokenAddress"
                        placeholder={t('prepare.placeholder_address')}
                        typeInput={TYPE_INPUT.SELECT}
                        options={options}
                        optionsRenderProps={OptionRender}
                        showSearch
                        searchValue={searchText}
                        errors={errors}
                        value={values.tokenAddress || undefined}
                        showError={false}
                        onChange={handleOnChange}
                        onBlur={handleBlur}
                        onKeyDown={handleOnEnterKey}
                        onSearch={(e: string) => handleOnSearch(e, setFieldValue)}
                        popupClassName="prepare__address__dropdown"
                        dropdownMatchSelectWidth
                        onSelect={setCurrentValidToken}
                        suffixIcon={
                          values.tokenAddress ? (
                            <>
                              {isGettingBalance && <LoadingComponent spinning size={18} />}
                              <span
                                onClick={handleClearInput(setFieldValue, 'tokenAddress')}
                                role="img"
                                aria-label="close"
                                tabIndex={-1}
                                className="anticon anticon-close"
                              >
                                <IconClose />
                              </span>
                            </>
                          ) : (
                            <IconArrowDown />
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className={cx('prepare__decimals')}>
                    <div className={cx('form-item__label')}>{t('prepare.decimals')}</div>
                    <div className="prepare__decimals--number">
                      <NumberFormat decimalScale={4} displayType="text" value={decimals} thousandSeparator />
                    </div>
                  </div>

                  {errors.tokenAddress && (checkTouchSelect(touched) || touched.tokenAddress) && (
                    <ErrorMessage error={errors.tokenAddress} />
                  )}
                </div>

                <div className={cx('form-item__label')}>
                  <Row justify="space-between">
                    <Col>{t('prepare.label_recipient')}</Col>
                    <Col className={cx('prepare__upload')} onClick={handleChangeUploadMethod}>
                      <Space size={8}>
                        {!upload ? (
                          <>
                            <IconUpload />
                            {t('prepare.upload_file')}
                          </>
                        ) : (
                          <>
                            <IconEdit />
                            {t('prepare.insert_manually')}
                          </>
                        )}
                      </Space>
                    </Col>
                  </Row>
                </div>

                {!upload ? (
                  <AutoLineTextArea
                    name="recipientsAmount"
                    placeholder={t('prepare.placeholder_recipient')}
                    errors={errors}
                    onChange={handleChange}
                    countLine={countLine}
                    setCountLine={setCountLine}
                    errorLines={errorLines}
                    onBlur={handleTextAreaBlur(handleBlur, setFieldValue, values)}
                    innerRef={textAreaRef}
                  />
                ) : (
                  <div className={cx('prepare__dragger')}>
                    <Dragger
                      name="files"
                      multiple={true}
                      showUploadList={false}
                      beforeUpload={(file) =>
                        readFileContent(file, 'recipientsAmount', setFieldValue, setTouched, touched)
                      }
                    >
                      <div>
                        <IconDragUpload />
                      </div>
                      <p>{t('prepare.upload_instruction')}</p>
                    </Dragger>
                  </div>
                )}

                <Row justify="space-between" className={cx('prepare__instruction')}>
                  {!upload ? (
                    <>
                      <Col className={cx('prepare__instruction__text')}>
                        <p>{t('prepare.support_format')}</p>
                      </Col>
                      <Col>
                        <TooltipsExample />
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col className={cx('prepare__instruction__text')}>
                        <p>{t('prepare.accepted_format')}</p>
                      </Col>
                      <Col>
                        <TooltipsExampleFile chainId={chainId} />
                      </Col>
                    </>
                  )}
                </Row>

                {errors.recipientsAmount && <ErrorMessage error={errors.recipientsAmount as any} />}

                {wrongFormat && <ErrorMessage error={ERROR_INPUT_ADDRESS.E15} />}

                {errorLines.length >= 1 && (
                  <ListInvalidAccount
                    errorLines={errorLines}
                    handleDeleteInvalidLines={handleDeleteInvalidLines(setFieldValue, values)}
                    textAreaRef={textAreaRef}
                    recipientsAmount={values?.recipientsAmount}
                  />
                )}

                <div className="prepare__button">
                  <AppButton text={t('prepare.next')} htmlType="submit" />
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Row>
  );
};

export default memo(Prepare);
