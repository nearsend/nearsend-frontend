import { CHAIN_INFO, SUPPORTED_CHAIN_IDS } from 'connectors/constants';
import { useAppSelector } from 'hooks/useStore';
import { FC, useMemo } from 'react';
import selectedAddress from 'store/address/selector';
import { ChainFactory } from 'utils/chains/ChainFactory';

const MobileListNetwork: FC<{
  handleChangeNetwork: (chainId: string) => void;
}> = ({ handleChangeNetwork }) => {
  const { chainId, network } = useAppSelector(selectedAddress.getAddress);

  const listChainToSwap = useMemo(
    () =>
      SUPPORTED_CHAIN_IDS.map((chainId: string | number) => {
        const { icon, name, valueString } = CHAIN_INFO?.[chainId] || {};
        return {
          value: valueString,
          name,
          image: icon,
        };
      }),
    [],
  );

  const getNetworkValue = () => {
    if (SUPPORTED_CHAIN_IDS.includes(chainId?.toString())) {
      return chainId?.toString();
    } else {
      const defaultSupportedChain = new ChainFactory().getNetwork(network)?.getDefaultSupportNetwork();
      return defaultSupportedChain;
    }
  };

  return (
    <div className="networks">
      {listChainToSwap.map((value, index) => {
        return (
          <div key={index} onClick={() => handleChangeNetwork(value.value as string)} className="network-item">
            <img src={value.image as string} alt="network-icon" />
            <div className={getNetworkValue() === value?.value ? 'text-highlight' : 'text'}>{value.name}</div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileListNetwork;
