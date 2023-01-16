import { useEffect } from 'react';

import { useAppSelector } from './useStore';
import Socket from 'services/SocketService';
import selectedAddress from 'store/address/selector';

export const useSocket = ({
  event,
  handleEvent,
  dependences,
}: {
  event: string | string[];
  handleEvent: any;
  dependences?: any;
}) => {
  const { address } = useAppSelector(selectedAddress.getAddress);

  useEffect(() => {
    const socketIo = new Socket();
    const socketInstance = socketIo.getInstance();

    if (address) {
      socketInstance.on(event, (data: any) => {
        handleEvent(data);
      });
    }
    return () => {
      socketInstance.close();
      socketIo.removeInstance();
    };
  }, [address, ...(dependences || [])]);
};
