// import { useTranslation } from "react-i18next";
// const {t} = useTranslation()

const ERROR_INPUT_ADDRESS = {
  E1: 'Please input token first',
  E2: 'Invalid token address',
  E3: 'Please provide at least 1 address',
  E4: 'The below transactions cannot be processed',
  E5: 'Wrong amount',
  E6: (wrongAddress: string, chainId: string) => `Given address "${wrongAddress}" is not a valid ${chainId} address`,
  E7: 'Invalid wallet address and wrong amount',
  E8: 'Decimals of amount can not be greater than token decimals',
  E15: 'File format is invalid. Accepted formats : .csv ; .xls ; .txt',
  E17: 'You cannot input your own wallet address',
  E18: 'You cannot input Nearsend smart contract address',
};

export default ERROR_INPUT_ADDRESS;
