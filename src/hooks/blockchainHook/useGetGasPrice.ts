import { CONTRACT_ID } from 'connectors/constants';
import { minusValue } from '../../services/WalletService/utils/number';
import { greaterThan } from 'services/WalletService/utils/number';
import { useAppDispatch } from '../useStore';
import { useChainFactory } from 'hooks/walletHook/useChainFactory';
import { useState } from 'react';
import { setAppLoading } from 'store/global/slice';

const useGetGasPrice = () => {
  const dispatch = useAppDispatch();

  const [isGettingGasPrice, setIsGettingGasPrice] = useState(false);
  const [hasGetGasPrice, setHasGetGasPrice] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  const { getConnectedChainInfo, getWallet } = useChainFactory();

  const getGasPrice = async () => {
    const { chainId, account, library } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    setIsGettingGasPrice(true);
    setHasGetGasPrice(false);

    try {
      if (account && chainId && library) {
        const gasPrice = await wallet?.getGasPrice({
          library,
          account,
        });

        return new Promise((resolve) => resolve(gasPrice));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsGettingGasPrice(false);
      setHasGetGasPrice(true);
    }
  };

  const getStorageFee = async (listData: any[], tokenContract: string) => {
    const { chainId, library } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    dispatch(setAppLoading(true));
    setCurrentProgress(0);

    try {
      if (chainId && library) {
        const [storageFee, appContractStorageFee, storageBalanceBound] = await Promise.all([
          wallet?.getStorageFee({
            library,
            data: {
              listData,
              batchLimit: 25,
              tokenContract,
            },
            callback: (current: number): void => {
              setCurrentProgress((current / listData?.length) * 100);
            },
          }),
          wallet?.getStorageFee({
            library,
            data: {
              listData: [{ address: CONTRACT_ID[chainId as string] }],
              batchLimit: 25,
              tokenContract,
            },
          }),
          wallet?.getStorageBalanceBounds({
            library,
            data: {
              tokenContract,
            },
          }),
        ]);
        let storageFeeList: any[] = [];
        let appContractStorageFeeNeed = 0;

        if (!storageBalanceBound?.max) {
          storageFeeList = (storageFee || []).map((data) => {
            const storageFeeNeed = greaterThan(storageBalanceBound?.min, data?.total) ? storageBalanceBound?.min : 0;

            return {
              ...data,
              storageFeeNeed,
            };
          });

          appContractStorageFeeNeed = greaterThan(storageBalanceBound?.min, appContractStorageFee?.[0]?.total)
            ? storageBalanceBound?.min
            : 0;
        } else {
          storageFeeList = (storageFee || []).map((data) => {
            const storageFeeNeed = greaterThan(storageBalanceBound?.min, minusValue([data?.total, data?.available]))
              ? storageBalanceBound?.min
              : 0;

            return {
              ...data,
              storageFeeNeed,
            };
          });

          appContractStorageFeeNeed = greaterThan(
            storageBalanceBound?.min,
            minusValue([appContractStorageFee?.[0]?.total, appContractStorageFee?.[0]?.available]),
          )
            ? storageBalanceBound?.min
            : 0;
        }

        return {
          appContractStorageFeeNeed,
          storageFeeList,
          minStorageFee: storageBalanceBound?.min,
        };
      }
    } catch (e) {
      console.log(e);
    } finally {
      dispatch(setAppLoading(false));
    }
  };

  return {
    getGasPrice,
    isGettingGasPrice,
    getStorageFee,
    currentProgress,
    hasGetGasPrice,
  };
};

export default useGetGasPrice;
