import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Space, Image } from 'antd';

import { useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import { CHAIN_INFO, SUPPORTED_CHAIN_IDS } from 'connectors/constants';
import { ChainFactory } from 'utils/chains/ChainFactory';

const { Option } = Select;

const SelectNetwork: FC<{
  handleChangeNetwork: (chainId: string) => void;
}> = ({ handleChangeNetwork }) => {
  const { t } = useTranslation();

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

  const optionsRenderProps = (item: any) => {
    return (
      <Space size={12}>
        <Image width={16} height={16} preview={false} src={item?.image} alt="" />
        {t(item?.name)}
      </Space>
    );
  };

  const getNetworkValue = () => {
    if (SUPPORTED_CHAIN_IDS.includes(chainId?.toString())) {
      return chainId?.toString();
    } else {
      const defaultSupportedChain = new ChainFactory().getNetwork(network)?.getDefaultSupportNetwork();
      return defaultSupportedChain;
    }
  };

  return (
    <Select
      value={getNetworkValue()}
      placeholder={t('common.select_network')}
      onSelect={handleChangeNetwork}
      getPopupContainer={(trigger: any) => trigger.parentElement}
      dropdownMatchSelectWidth={false}
      placement="bottomRight"
    >
      {listChainToSwap.map((item: any) => (
        <Option value={item.value} key={item?.key || item.value} label={item.name}>
          {optionsRenderProps(item)}
        </Option>
      ))}
    </Select>
  );
};

export default SelectNetwork;
