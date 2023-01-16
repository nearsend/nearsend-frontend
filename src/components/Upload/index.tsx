import { FC } from 'react';
import { Upload, Button } from 'antd';
import { CameraFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import showMessage from 'components/Message';
import TYPE_CONSTANTS from 'constants/type';

type UploadType = {
  onChange: any;
  maxSizeMB: number;
  maxSize: number;
  listFileTypeSupport: string[];
  setLoading?: any;
  content?: any;
  fileTypeErrorMessage?: string;
};
const UploadComponent: FC<UploadType> = ({
  onChange,
  maxSize,
  maxSizeMB,
  listFileTypeSupport,
  setLoading,
  content,
  fileTypeErrorMessage,
}) => {
  const { t } = useTranslation();

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      onChange(info.file);
    }
    setLoading && setLoading(false);
  };

  const handleBeforeUpload = (file: any) => {
    if (!listFileTypeSupport.includes(file.type)) {
      showMessage(TYPE_CONSTANTS.MESSAGE.ERROR, t(fileTypeErrorMessage || ''));
      return Upload.LIST_IGNORE;
    } else if (maxSize && file.size > maxSize) {
      showMessage(TYPE_CONSTANTS.MESSAGE.ERROR, t('', { size: maxSizeMB }));
      return Upload.LIST_IGNORE;
    }
    setLoading && setLoading(true);
    return true;
  };

  return (
    <Upload showUploadList={false} onChange={handleChange} beforeUpload={handleBeforeUpload}>
      {content || <Button icon={<CameraFilled />}>{t('common.upload')}</Button>}
    </Upload>
  );
};

export default UploadComponent;
