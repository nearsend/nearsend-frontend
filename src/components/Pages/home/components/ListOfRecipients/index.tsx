import { useEffect, FC, useState, useRef, memo } from 'react';
import { Col, Row, Typography } from 'antd';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import AppButton from 'components/AppButton';
import BoundedNumberFormat from 'components/BoundedNumberFormat';
import { FORMAT_DECIMAL_SCALE } from 'services/WalletService/constants';
import { addValue } from 'services/WalletService/utils/number';
import { useSendToken } from 'context/SendTokenContext';
import AddressTable from '../AddressTable';
import FormItem, { TYPE_INPUT } from 'components/FormItem';
import LENGTH_CONSTANTS from 'constants/length';
import IconSearch from 'resources/svg/IconSearch';
import useListAddress from 'hooks/layoutHook/useListAddress';

const { Paragraph } = Typography;

type ListOfRecipientsProps = {
  listAddress: any[];
  address: string;
  next: () => void;
  prev: () => void;
  hasDuplicatedAddress: boolean;
};

const ListOfRecipients: FC<ListOfRecipientsProps> = ({ address, listAddress, next, prev, hasDuplicatedAddress }) => {
  const { t } = useTranslation();

  const formikRef = useRef<any>(null);

  const [totalAmount, setTotalAmount] = useState(0);
  const [listAddressUnfiltered, setListAddressUnfiltered] = useState<any[]>([]);
  const [listAddressFiltered, setListAddressFiltered] = useState<any[]>([]);

  const { listAddressToSend, setListAddressToSend, tokenInfo, setListAddress } = useSendToken();
  const {
    getListAddress,
    createListAddress,
    listAddressId,
    updateListAddress,
    fetched: hasFetchedListAddress,
    listAddress: savedListAddress,
  } = useListAddress();

  useEffect(() => {
    (async () => {
      await getListAddress();
    })();
  }, []);

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
    if (!!address && listAddress?.length > 0) {
      let totalAmount = 0;
      const listAddressUnfiltered = listAddress.map((address, index) => {
        totalAmount = addValue([totalAmount, address?.amount]);
        return {
          no: index + 1,
          ...address,
        };
      });

      setListAddressToSend(listAddressUnfiltered);
      setListAddressUnfiltered(listAddressUnfiltered);
      setListAddressFiltered(listAddressUnfiltered);
      setTotalAmount(totalAmount);
    }
  }, [listAddress, address]);

  const onSubmit = () => {};

  const onSearch = (setFieldValue: any, values: any) => () => {
    const searchValue = values?.filterAddress?.trim();
    let listAddressFiltered = [];

    setFieldValue('filterAddress', values?.filterAddress?.trim());

    listAddressFiltered = searchValue
      ? listAddressUnfiltered.filter(({ address }) => address?.toLowerCase()?.includes(searchValue?.toLowerCase()))
      : listAddressUnfiltered;

    setListAddressFiltered(listAddressFiltered);
  };

  return (
    <>
      <Paragraph className="setup-accounts__notice">
        <span>{t('send_token.double_check')}</span>
      </Paragraph>

      {hasDuplicatedAddress && (
        <Paragraph className="setup-accounts__dulicate">{t('send_token.note_handle_duplicate_address')}</Paragraph>
      )}
      <div className="setup-accounts">
        <Formik innerRef={formikRef} initialValues={{ filterAddress: '' }} onSubmit={onSubmit}>
          {({ setFieldValue, values }) => (
            <Form autoComplete="off">
              <FormItem
                name="filterAddress"
                placeholder={t('send_token.search_address')}
                maxLength={LENGTH_CONSTANTS.MAX_LENGTH_INPUT}
                typeInput={TYPE_INPUT.SEARCH}
                enterButton={<IconSearch />}
                onBlur={onSearch(setFieldValue, values)}
                onSearch={onSearch(setFieldValue, values)}
              />
            </Form>
          )}
        </Formik>
        <AddressTable tokenSymbol={tokenInfo?.symbol} listAddress={listAddressFiltered} />

        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
            <Paragraph className="text-detail">
              {t('common.total_address')}:{' '}
              <BoundedNumberFormat displayType="text" thousandSeparator value={listAddressToSend?.length || 0} />
            </Paragraph>
          </Col>
          <Col>
            <Paragraph className="text-detail">
              {t('common.total_amount')}:{' '}
              <BoundedNumberFormat
                displayType="text"
                thousandSeparator
                value={totalAmount || 0}
                decimalScale={FORMAT_DECIMAL_SCALE}
                suffix={` ${tokenInfo?.symbol}`}
              />
            </Paragraph>
          </Col>
        </Row>

        <Row className="button-group" gutter={[24, 16]}>
          <Col>
            <AppButton variant="secondary" text={t('common.back')} onClick={prev} />
          </Col>
          <Col>
            <AppButton text={t('common.next')} onClick={next} />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default memo(ListOfRecipients);
