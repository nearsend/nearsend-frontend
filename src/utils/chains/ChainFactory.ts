import { CHAIN_ID, SUPPORTED_NETWORK } from 'connectors/constants';
import { NearChain } from './NearChain';

export class ChainFactory {
  constructor() {}

  getChain(chainId: number | string) {
    if (!chainId) {
      return null;
    }

    switch (chainId) {
      case CHAIN_ID.NEAR:
      case CHAIN_ID.NEAR_TEST:
        return new NearChain().getInstance() as NearChain;
      default:
        return null;
    }
  }

  getNetwork(network: string) {
    if (!network) {
      return null;
    }

    switch (network) {
      case SUPPORTED_NETWORK.NEAR: {
        return new NearChain().getInstance() as NearChain;
      }
      default:
        return null;
    }
  }
}
