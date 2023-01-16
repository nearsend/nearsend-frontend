import BigNumber from 'bignumber.js';

BigNumber.config({
  EXPONENTIAL_AT: 100,
});

export const greaterThanOrEqualTo = (
  number1: string | number | null | undefined,
  number2: string | number | null | undefined,
) => {
  return new BigNumber(number1 || 0).isGreaterThanOrEqualTo(new BigNumber(number2 || 0));
};

export const greaterThan = (number1: string | number, number2: string | number) => {
  return new BigNumber(number1).isGreaterThan(new BigNumber(number2));
};

export const formatNumber = (value: string | number) => {
  return new BigNumber(value).toFormat();
};

export const convertToBigNumber = (value: BigNumber.Value) => {
  return new BigNumber(value);
};

export const convertToDecimal = (value: BigNumber.Value) => {
  return new BigNumber(value, 10).toString();
};

export const convertPrice = (value: BigNumber.Value, decimalScale: number | undefined): BigNumber => {
  return new BigNumber(value).multipliedBy(new BigNumber(Math.pow(10, decimalScale || 0)));
};

export const convertBalance = (value: BigNumber.Value, decimalScale: number | undefined): BigNumber => {
  return new BigNumber(value).multipliedBy(new BigNumber(Math.pow(10, -(decimalScale || 0))));
};

export const dividedPrice = (value: BigNumber.Value, decimalScale?: number): BigNumber => {
  return new BigNumber(value).dividedBy(new BigNumber(Math.pow(10, decimalScale || 0)));
};

export const ceilValue = (value: BigNumber.Value): string =>
  new BigNumber(value).integerValue(BigNumber.ROUND_CEIL).toString();

export const timesValue = (number1: BigNumber.Value, number2: BigNumber.Value): string =>
  new BigNumber(number1 || 0).times(number2 || 0).toString();

export const convertToNumber = (number: BigNumber.Value): number => new BigNumber(number).toNumber();

export const convertToCoinInput = (amount: BigNumber.Value, decimalScale: number): string => {
  const number = new BigNumber(amount ?? 0).div(new BigNumber(10).pow(decimalScale));
  return amount ? number.decimalPlaces(6, BigNumber.ROUND_DOWN).toString() : '0';
};

export const convertDecimal = (amount: BigNumber.Value, decimalScale: number): string => {
  return new BigNumber(amount).decimalPlaces(decimalScale, BigNumber.ROUND_DOWN).toString();
};

export const addValue = (value: any[]) => {
  return value
    .reduce((acc: BigNumber.Value, cur: BigNumber.Value) => {
      return new BigNumber(acc).plus(new BigNumber(cur));
    }, 0)
    .toString();
};

export const minusValue = (value: any[]) => {
  const excludedFirstValueArray = value.splice(1);

  return excludedFirstValueArray
    .reduce((acc: BigNumber.Value, cur: BigNumber.Value) => {
      return new BigNumber(acc).minus(new BigNumber(cur));
    }, value[0])
    .toString();
};

export const multiplyValue = (value: any[]) => {
  return value
    .reduce((acc: BigNumber.Value, cur: BigNumber.Value) => {
      return new BigNumber(acc).multipliedBy(new BigNumber(cur));
    }, 1)
    .toString();
};

export const calculatePercentage = (value: BigNumber.Value, total: BigNumber.Value) => {
  if (!value || !total) {
    return 0;
  }
  return new BigNumber(value).dividedBy(new BigNumber(total)).multipliedBy(100).decimalPlaces(18).toString();
};

export const divideNumber = (value: BigNumber.Value, value2: BigNumber.Value) => {
  return new BigNumber(value).dividedBy(new BigNumber(value2)).toString();
};