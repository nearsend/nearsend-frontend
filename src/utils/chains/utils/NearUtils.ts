import { ChainUtils } from './ChainUtils';

let nearInstance: any = null;

export class NearUtils extends ChainUtils {
  constructor() {
    super();
  }

  getInstance<NearChain>(): NearChain | null {
    if (nearInstance == null) {
      nearInstance = new NearUtils();
      nearInstance.constructor = () => {};
    }
    return nearInstance as NearChain;
  }

  removeInstance() {
    nearInstance = null;
  }

  convertAddressToDisplayValue(address: string, lengthBeforeSlice = 3): string {
    if (!address) {
      return '';
    }

    const [beforeDot, afterDot] = address.split('.');

    if (beforeDot?.length < lengthBeforeSlice + 4) {
      return address;
    }

    return address
      ? afterDot
        ? [
            beforeDot.slice(0, lengthBeforeSlice) + '...' + beforeDot.slice(beforeDot.length - 3, beforeDot.length),
            afterDot,
          ].join('.')
        : beforeDot.slice(0, 6) + '...' + beforeDot.slice(beforeDot.length - 4, beforeDot.length)
      : '';
  }
}
