import { CHAIN_ID, CONTRACT_ID, NATIVE_TOKEN } from 'connectors/constants';
import ERROR_INPUT_ADDRESS from 'constants/error';
import { trimSpace } from 'utils/string';
import { addMethod, object, string } from 'yup';

export const REGEX_ADDRESS_AMOUNT =
  /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+([\,])(([0-9]+[\,\.])?[0-9]+)$/g;
export const REGEX_ADDRESS = /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+/g;
export const REGEX_AMOUNT = /([\,])(([0-9]+[\,\.])?[0-9]+)$/g;

export const handleValidAddress = (address: string, setCurrentValidToken: any) => {
  if (!!address?.match(REGEX_ADDRESS) || address === NATIVE_TOKEN) {
    if (typeof setCurrentValidToken === 'function') {
      setCurrentValidToken(address);
    }
    return true;
  }
  return false;
};

export const handleAtLeastOneAccounts = (addresses: string) => {
  const { resultString, count } = trimSpace(addresses);
  const arr = resultString.split('\n');
  if (count === 0) {
    return false;
  } else {
    let countValidAddress = 0;
    for (const address of arr) {
      if (countValidAddress === 1) {
        break;
      }
      if (address.match(REGEX_ADDRESS)) {
        countValidAddress++;
      }
    }
    return !!(countValidAddress === 1);
  }
};

export const handleValidRecipients = (
  addresses: string,
  setErrorLines: any,
  decimals: any,
  chainId: string,
  address: string,
) => {
  const { resultString, count } = trimSpace(addresses);
  const arr = resultString.split('\n');
  const net = chainId === CHAIN_ID.NEAR_TEST ? 'NEAR Testnet' : 'NEAR Mainet';

  const newErrorLines = [];
  for (let i = 0; i < count; i++) {
    const amount = arr[i].match(REGEX_AMOUNT)?.[0];
    if (!arr[i].match(REGEX_ADDRESS_AMOUNT)) {
      if (amount) {
        const address = arr[i].split(amount)[0];
        newErrorLines.push({ line: i + 1, error: ERROR_INPUT_ADDRESS.E6(address, net) });
      } else {
        const len = arr[i].length;
        let indexSplit = -1;
        for (let j = 0; j < len; j++) {
          if (arr[i][j].match(/[\,]/g)) {
            indexSplit = j;
            break;
          }
        }
        let address;
        if (indexSplit === -1) {
          address = arr[i];
        } else {
          address = arr[i].slice(0, indexSplit);
        }

        if (address.match(REGEX_ADDRESS) && address.length >= 2 && address.length <= 64) {
          newErrorLines.push({ line: i + 1, error: ERROR_INPUT_ADDRESS.E5 });
        } else {
          newErrorLines.push({ line: i + 1, error: ERROR_INPUT_ADDRESS.E7 });
        }
      }
    } else {
      const exactAmount = amount?.slice(1);
      const exactAddress = arr[i].split(amount as string)[0];

      if (Number(exactAmount) === 0) {
        newErrorLines.push({ line: i + 1, error: ERROR_INPUT_ADDRESS.E5 });
      } else {
        if (decimals.toString()) {
          const amountDecimals = exactAmount?.split(/[\.\,]/g)[1] || '';

          if (amountDecimals?.length > decimals) {
            newErrorLines.push({ line: i + 1, error: ERROR_INPUT_ADDRESS.E8 });
          }
        }
      }

      // const contractId = CONTRACT_ID[chainId] || CONTRACT_ID[CHAIN_ID.NEAR_TEST];
      if (exactAddress === address) {
        newErrorLines.push({ line: i + 1, error: ERROR_INPUT_ADDRESS.E17 });
      }
      // else if (exactAddress === contractId) {
      //   newErrorLines.push({ line: i + 1, error: ERROR_INPUT_ADDRESS.E18 });
      // }

      const lenAddress = exactAddress.length;
      if (lenAddress < 2 || lenAddress > 64) {
        newErrorLines.push({ line: i + 1, error: ERROR_INPUT_ADDRESS.E6(exactAddress, net) });
      }
    }
  }
  setErrorLines(newErrorLines);
  return !newErrorLines.length;
};

export default function createPrepareSchema({
  setErrorLines,
  setCurrentValidToken,
  decimals,
  chainId,
  address,
}: {
  setErrorLines: any;
  setCurrentValidToken: any;
  decimals: any;
  chainId: string;
  address: string;
}) {
  addMethod(string, 'checkValidRecipients', function (errorMessage) {
    return this.test('valid-recipients', errorMessage, function (addresses) {
      const { path, createError } = this;

      return (
        handleValidRecipients(addresses as string, setErrorLines, decimals, chainId, address) ||
        createError({ path, message: errorMessage })
      );
    });
  });

  addMethod(string, 'checkAtLeastOneAccounts', function (errorMessage) {
    return this.test('at-least-2-accs', errorMessage, function (addresses) {
      const { path, createError } = this;

      return handleAtLeastOneAccounts(addresses as string) || createError({ path, message: errorMessage });
    });
  });

  addMethod(string, 'checkValidToken', function (errorMessage) {
    return this.test('check-valid-token', errorMessage, function (address) {
      const { path, createError } = this;
      return (
        handleValidAddress(address as string, setCurrentValidToken) || createError({ path, message: errorMessage })
      );
    });
  });

  return object({
    tokenAddress: string()
      .required(ERROR_INPUT_ADDRESS.E1)
      // @ts-ignore-next-line
      .checkValidToken(ERROR_INPUT_ADDRESS.E2)
      .max(256),
    recipientsAmount: (string() as any).checkAtLeastOneAccounts(ERROR_INPUT_ADDRESS.E3).checkValidRecipients(''),
  });
}

export type PrepareFormValue = {
  tokenAddress: string;
  recipientsAmount: string;
};
