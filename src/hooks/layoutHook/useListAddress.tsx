import { useState } from 'react';

import { useAppDispatch, useAppSelector } from 'hooks/useStore';
import listAddressService from 'services/listAddress';
import selectedAddress from 'store/address/selector';
import { setAppLoading } from 'store/global/slice';

const useListAddress = () => {
  const dispatch = useAppDispatch();

  const [listAddressId, setListAddressId] = useState('');
  const [listAddress, setListAddress] = useState([]);
  const [fetched, setFetched] = useState(false);

  const { address } = useAppSelector(selectedAddress.getAddress);

  const getListAddress = async () => {
    dispatch(setAppLoading(true));

    try {
      if (address) {
        const response = await listAddressService.getListAddress(address);
        const data = response?.data?.[0];

        if (response?.code === '1' && data?.addressSender === address) {
          setListAddressId(data?.id);
          setListAddress(data?.accounts);

          setFetched(true);
          return data?.id;
        }

        setFetched(true);
      }
    } catch (e) {
      setFetched(true);
    } finally {
      dispatch(setAppLoading(false));
    }
  };

  const createListAddress = async (listAddress: any[]) => {
    try {
      if (address) {
        await listAddressService.createListAddress({
          addressSender: address,
          accounts: listAddress.map(({ address, amount }) => ({ address, amount, isEnabled: true })),
        });
      }
    } catch (e) {}
  };

  const updateListAddress = async (id: string, listAddress: any[]) => {
    dispatch(setAppLoading(true));

    try {
      if (address) {
        await listAddressService.updateListAddress(id, {
          accounts:
            listAddress?.length > 0
              ? listAddress.map(({ address, amount }) => ({ address, amount, isEnabled: true }))
              : [],
        });
      }
    } catch (e) {
    } finally {
      dispatch(setAppLoading(false));
    }
  };

  return { getListAddress, createListAddress, updateListAddress, listAddressId, fetched, listAddress };
};

export default useListAddress;
