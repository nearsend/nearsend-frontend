import { SUPPORTED_CHAIN_IDS } from '../../connectors/constants';
import { SUPPORTED_NETWORK } from 'connectors/constants';
import NearChainService from 'services/WalletService/NearChainService';
import { Chain } from './Chain';
import { NearUtils } from './utils/NearUtils';

let nearInstance: any = null;

export class NearChain extends Chain {
  constructor() {
    super();
  }

  getInstance<NearChain>(): NearChain | null {
    if (nearInstance == null) {
      nearInstance = new NearChain();
      nearInstance.constructor = () => {};
    }
    return nearInstance as NearChain;
  }

  removeInstance() {
    nearInstance = null;
  }

  getNetworkType() {
    return SUPPORTED_NETWORK.NEAR;
  }

  getDefaultSupportNetwork() {
    return SUPPORTED_CHAIN_IDS[0];
  }

  getService() {
    return new NearChainService().getInstance() as NearChainService;
  }

  getUtils() {
    return new NearUtils().getInstance() as NearUtils;
  }
}
