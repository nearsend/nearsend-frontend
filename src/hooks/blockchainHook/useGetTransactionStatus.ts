import { useChainFactory } from 'hooks/walletHook/useChainFactory';

// transactionHashes=J4FFyYAMkmr45y7zTGBU7mrGEJvb2kEvVWp1ivNsLDi4%2C8rShdgP4inKps5cM1KF8UNe6b1vgsgDToAVF26xxaePz
// transactionHashes=EpnMB7TuiCqv1WtqQDNSCTKFnZ561RE3XT79rKPTffzx%2CA4n7BdwFJ1XBsoubPWm9CQQSbqkb3R6ZVXWTPBDNKs96

//NEAR
// transactionHashes=EM3o7u25JqksWwd8bnyQjPuBVt24rcft25eMu7zWoMiF
//HKJ2nL3yAxXxJJh5Hsjq1YkVhTW7Jn9y3sxSzivkftJS

const useGetTransactionStatus = () => {
  const { getConnectedChainInfo, getWallet } = useChainFactory();

  const getTransactionStatus = async (txHash: string[]) => {
    const { chainId, account, library } = getConnectedChainInfo() || {};
    const wallet = getWallet();

    try {
      if (account && chainId && library) {
        const transactionStatus = await wallet?.getTransactionStatusReceipts({
          library,
          txHash,
          account,
        });

        return transactionStatus?.map((response) => {
          if (response?.status === 200) {
            return response?.data?.result || {};
          } else {
            return {};
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return {
    getTransactionStatus,
  };
};

export default useGetTransactionStatus;
