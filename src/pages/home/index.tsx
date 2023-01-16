import { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Progress, Tabs, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import cx from 'classnames';

import Summary from 'components/Pages/home/components/Summary';
import SendToken from 'components/Pages/home/components/SendToken';
import Prepare from 'components/Pages/home/components/Prepare';
import { useAppSelector } from 'hooks/useStore';
import selectedAddress from 'store/address/selector';
import LandingSection from 'components/Pages/home/components/LandingSection';
import IconPrepare from 'resources/svg/IconPrepare';
import IconConfirm from 'resources/svg/IconConfirm';
import IconSend from 'resources/svg/IconSend';
import IconArrowDown from 'resources/svg/IconArrowDown';
import SetupTokenAccounts from 'components/Pages/home/components/SetupTokenAccounts';
import { addValue } from 'services/WalletService/utils/number';
import { INITIAL_STEP, STEPS, useSendToken } from 'context/SendTokenContext';
import IconSetup from 'resources/svg/IconSetup';
import { NATIVE_TOKEN } from 'connectors/constants';
import ListOfRecipients from 'components/Pages/home/components/ListOfRecipients';
import Head from 'components/Layout/Head';
import selectGlobalState from 'store/global/selector';

export const STEPS_LINK = {
  [STEPS.PREPARE]: 'prepare',
  [STEPS.SETUP]: 'setup',
  [STEPS.SUMMARY]: 'summary',
  [STEPS.SEND]: 'send',
};

const { Title } = Typography;

const HomePage = () => {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const [minifiedListAddress, setMinifiedListAddress] = useState<any[]>([]);
  const [hasDuplicatedAddress, setHasDuplicatedAddress] = useState(false);

  const { currentStep, setCurrentStep, listAddress, tokenInfo } = useSendToken();

  const { address } = useAppSelector(selectedAddress.getAddress);
  const queryParams = useAppSelector(selectGlobalState.getQueryParams);

  const checkIsLogin = () => !!address;
  const [isMinimize, setIsMinimize] = useState(checkIsLogin);

  const navigate = useCallback(
    (step: number) => () => {
      searchParams.set('step', STEPS_LINK[step]);
      searchParams.delete('transactionHashes');
      searchParams.delete('errorCode');
      searchParams.delete('errorMessage');

      setSearchParams(searchParams);
      setCurrentStep(Object.values(STEPS_LINK).findIndex((value: string) => value === STEPS_LINK[step]));
    },
    [],
  );

  useEffect(() => {
    if (address) {
      setIsMinimize(true);
    }
  }, [address]);

  useEffect(() => {
    if (!isEmpty(queryParams)) {
      const { step } = queryParams || {};

      if (step) {
        navigate(Object.values(STEPS_LINK).findIndex((value: string) => value === step))();
      } else {
        navigate(INITIAL_STEP)();
      }
    } else {
      navigate(INITIAL_STEP)();
    }
  }, [queryParams]);

  const toggleMinimize = () => {
    setIsMinimize((previousState) => !previousState);
  };

  useEffect(() => {
    const _listAddress: Record<string, any> = {};
    let hasDuplicatedAddress = false;

    for (const d of listAddress) {
      if (!_listAddress[d?.address]) {
        _listAddress[d?.address] = { amount: d?.amount };
      } else {
        _listAddress[d?.address].amount = addValue([_listAddress[d?.address].amount, d?.amount]);
        hasDuplicatedAddress = true;
      }
    }

    if (Object.keys(_listAddress)?.length > 0) {
      setMinifiedListAddress(
        Object.entries(_listAddress).map(([address, data]) => ({
          address,
          ...data,
        })),
      );
    }
    setHasDuplicatedAddress(hasDuplicatedAddress);
  }, [listAddress]);

  const stepContent = useMemo(
    () =>
      [
        {
          title: 'send_token.prepare',
          content: <Prepare next={navigate(STEPS.SETUP)} />,
          icon: <IconPrepare />,
        },
        tokenInfo?.value === NATIVE_TOKEN
          ? {
              title: 'send_token.list_of_recipient',
              content: (
                <ListOfRecipients
                  next={navigate(STEPS.SUMMARY)}
                  prev={navigate(STEPS.PREPARE)}
                  listAddress={minifiedListAddress}
                  address={address}
                  hasDuplicatedAddress={hasDuplicatedAddress}
                />
              ),
              icon: <IconSetup />,
            }
          : {
              title: 'send_token.setup_token_accounts',
              content: (
                <SetupTokenAccounts
                  next={navigate(STEPS.SUMMARY)}
                  prev={navigate(STEPS.PREPARE)}
                  listAddress={minifiedListAddress}
                  address={address}
                  hasDuplicatedAddress={hasDuplicatedAddress}
                />
              ),
              icon: <IconSetup />,
            },
        ,
        {
          title: 'send_token.confirm',
          content: <Summary next={navigate(STEPS.SEND)} prev={navigate(STEPS.SETUP)} address={address} />,
          icon: <IconConfirm />,
        },
        {
          title: 'send_token.send',
          content: <SendToken navigate={navigate} />,
          icon: <IconSend />,
        },
      ].filter(Boolean),
    [tokenInfo?.value, minifiedListAddress, address, hasDuplicatedAddress],
  );

  const currentStepInfo = stepContent[Number(currentStep)];
  const currentStepProgress = ((Number(currentStep) + 1) / stepContent.length) * 100;

  return (
    <>
      <Head />
      <section id="home" className={cx('home-page', { minimized: isMinimize, connected: !!address })}>
        <div className="container">
          <LandingSection isConnecting={!!address} isMinimize={isMinimize} />
          {address && (
            <>
              <Title
                level={5}
                className={cx('step__title', {
                  minimized: isMinimize,
                })}
              >
                <div>
                  {currentStepInfo?.icon}
                  {t(currentStepInfo?.title || '')}
                </div>
                <span onClick={toggleMinimize}>{<IconArrowDown />}</span>
              </Title>

              <Progress className="step__progress" percent={currentStepProgress} status="active" showInfo={false} />

              <Tabs
                className="step__tabs"
                activeKey={currentStep.toString()}
                destroyInactiveTabPane
                items={stepContent.map((step, index) => ({
                  label: '',
                  key: index.toString(),
                  children: step?.content,
                }))}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
