import { Connection } from './slice';

const selectedConnection = {
  getConnection: (state: any) => state?.ConnectionSlice as Connection,
  getConnectedWalletType: (state: any) => state?.ConnectionSlice?.connectedWalletType,
  getConnectedWalletTypeByNetwork: (state: any) =>
    state?.ConnectionSlice?.connectedWalletType?.[state?.AddressSlice?.network],
};

export default selectedConnection;
