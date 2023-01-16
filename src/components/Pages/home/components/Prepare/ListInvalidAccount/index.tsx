import { Button } from 'antd';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { EditOutlined } from '@ant-design/icons';

import ErrorMessage from '../ErrorMessage';
import ERROR_INPUT_ADDRESS from 'constants/error';
import { trimSpace } from 'utils/string';

type ErrorLine = { line: number; error: string };
type ErrorLineProps = {
  errorLines: ErrorLine[];
  handleDeleteInvalidLines: any;
  textAreaRef: any;
  recipientsAmount: string;
};

const ListInvalidAccount: FC<ErrorLineProps> = ({
  errorLines,
  handleDeleteInvalidLines,
  textAreaRef,
  recipientsAmount,
}) => {
  const { t } = useTranslation();

  const renderDeleteAction = () => (
    <Button onClick={handleDeleteInvalidLines} className="list-invalid-account__btn">
      {t('button.delete')}
    </Button>
  );

  const handleSelectErrorLine = (errorLineIndex: number) => () => {
    let cursorPosition = 0;
    let recipientArray = recipientsAmount.split('\n');
    recipientArray = recipientArray.filter((recipient) => recipient !== '');
    for (const [i, line] of recipientArray.entries()) {
      if (i > errorLineIndex) {
        break;
      }
      cursorPosition += line?.length + 1;
    }

    textAreaRef.current.resizableTextArea.textArea.selectionStart =
      textAreaRef.current.resizableTextArea.textArea.selectionEnd =
        cursorPosition - 1 < 0 ? 0 : cursorPosition - 1 || 0;

    textAreaRef.current.focus();
  };

  return (
    <>
      <ErrorMessage error={ERROR_INPUT_ADDRESS.E4} action={renderDeleteAction()} />
      <div className="list-invalid-account">
        {errorLines?.map((item, index) => (
          <div key={index} className="list-invalid-account__item">
            <span className="list-invalid-account__line">Line {item.line}:</span>
            <span className="list-invalid-account__error">{item.error}</span>
            <EditOutlined onClick={handleSelectErrorLine(item?.line - 1)} />
          </div>
        ))}
      </div>
    </>
  );
};

export default memo(ListInvalidAccount);
