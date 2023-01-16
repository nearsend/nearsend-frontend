import { useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import { CHAIN_INFO, SUPPORTED_CHAIN_IDS } from 'connectors/constants';
import { ChainFactory } from 'utils/chains/ChainFactory';
import AppButton from 'components/AppButton';
import { useTranslation } from 'react-i18next';

const MobileSelectNetwork = ({ setSelectNetwork }: { setSelectNetwork: any }) => {
  const { chainId, network } = useAppSelector(selectedAddress.getAddress);
  const { address } = useAppSelector(selectedAddress.getAddress);
  const { t } = useTranslation();

  const getNetworkValue = () => {
    if (SUPPORTED_CHAIN_IDS.includes(chainId?.toString())) {
      return chainId?.toString();
    } else {
      const defaultSupportedChain = new ChainFactory().getNetwork(network)?.getDefaultSupportNetwork();
      return defaultSupportedChain;
    }
  };

  const handleSelectNetwork = () => setSelectNetwork(true);

  return (
    <AppButton
      onClick={handleSelectNetwork}
      prefixIcon={<img width={16} src={CHAIN_INFO?.[getNetworkValue()].icon as string} />}
      text={!!address ? t('header.switch_wallet') : CHAIN_INFO?.[getNetworkValue()].name}
      variant="secondary"
    />
  );
};

export default MobileSelectNetwork;
