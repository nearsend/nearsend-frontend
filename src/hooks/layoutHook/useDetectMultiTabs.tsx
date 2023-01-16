import { useEffect } from 'react';
import { BroadcastChannel } from 'broadcast-channel';

import { useAppDispatch } from 'hooks/useStore';
import { setIsOpeningMultipleTabs } from 'store/global/slice';

const TAB_KEY = 'application-browser-tab';
const MESSAGE = 'message-from-another-tab';
const REDIRECT_MESSAGE = 'redirect-to-block-multiple-tabs';

const useDetectMultiTabs = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const channel = new BroadcastChannel(TAB_KEY);
    let isMainTab = false;

    channel.postMessage(MESSAGE);
    // note that listener is added after posting the message

    channel.addEventListener('message', (msg) => {
      if (msg === MESSAGE) {
        isMainTab = true;
        channel.postMessage(REDIRECT_MESSAGE);
      }
      if (msg === REDIRECT_MESSAGE && !isMainTab) {
        dispatch(setIsOpeningMultipleTabs(true));
      }
    });
  }, []);
};

export default useDetectMultiTabs;
