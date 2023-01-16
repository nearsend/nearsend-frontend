import { useSendToken } from 'context/SendTokenContext';
import { useEffect } from 'react';
import useListAddress from './useListAddress';

const useRefetchListAddress = () => {
  const { listAddress, setListAddressToSend } = useSendToken();
  const { getListAddress, fetched: hasFetchedListAddress, listAddress: savedListAddress } = useListAddress();

  useEffect(() => {
    if (listAddress?.length === 0 && !hasFetchedListAddress) {
      (async () => {
        await getListAddress();
      })();
    } else if (savedListAddress?.length > 0 && hasFetchedListAddress) {
      setListAddressToSend(savedListAddress);
    }
  }, [listAddress, savedListAddress, hasFetchedListAddress]);
};

export default useRefetchListAddress;
