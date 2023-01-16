import { useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';
import { FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';

const useTranslateFormErrors = (
  errors: FormikErrors<any>,
  validateForm: (values?: any) => Promise<FormikErrors<any>>,
) => {
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.on('languageChanged', () => {
      if (!isEmpty(errors)) {
        //Hack to change validate message
        setTimeout(async () => {
          await validateForm();
        }, 0);
      }
    });
    return () => {
      i18n.off('languageChanged', () => {});
    };
  }, [errors]);
};

const WithTranslateFormErrors = ({
  errors,
  validateForm,
  children,
}: {
  errors: FormikErrors<any>;
  validateForm: (values?: any) => Promise<FormikErrors<any>>;
  children: any;
}) => {
  useTranslateFormErrors(errors, validateForm);
  return children;
};

export default WithTranslateFormErrors;
