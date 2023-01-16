import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from 'hooks/useStore';
import { setLanguage } from 'store/language/slice';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    i18n.on('languageChanged', async (lang: string) => {
      dispatch(setLanguage(lang));
    });
    return () => {
      i18n.off('languageChanged', () => {});
    };
  }, []);
  return;
};
