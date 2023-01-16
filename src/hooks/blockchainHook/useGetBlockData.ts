import { useAppDispatch } from 'hooks/useStore';
import { useChainFactory } from 'hooks/walletHook/useChainFactory';
import { setAppLoading } from 'store/global/slice';

const useGetBlockData = () => {
  const dispatch = useAppDispatch();

  const { getConnectedChainInfo, getWallet } = useChainFactory();

  const getBlockData = async (blockHashes: string[]) => {
    const { chainId, library } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    dispatch(setAppLoading(true));

    try {
      if (chainId && library) {
        const blockHashesData = await wallet?.getBlockData({
          library,
          data: {
            blockHashes,
            chainId: chainId as string,
            batchLimit: 25,
          },
        });

        return blockHashesData;
      }
    } catch (e) {
      console.log(e);
    } finally {
      dispatch(setAppLoading(false));
    }
  };
  return { getBlockData };
};

export default useGetBlockData;
