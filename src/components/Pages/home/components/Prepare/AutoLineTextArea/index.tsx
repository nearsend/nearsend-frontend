import cx from 'classnames';
import { FC, useEffect, useState } from 'react';

import FormItem, { TYPE_INPUT } from 'components/FormItem';

type AutoLineTextAreaProps = {
  name: string;
  placeholder: string;
  errors: any;
  onChange: any;
  onBlur: any;
  countLine: number;
  setCountLine: any;
  errorLines: any[];
  innerRef: any;
};

const AutoLineTextArea: FC<AutoLineTextAreaProps> = ({
  name,
  placeholder,
  errors,
  onChange,
  countLine,
  setCountLine,
  errorLines,
  onBlur,
  innerRef,
}) => {
  const [lines, setLines] = useState<number[]>([]);
  const [errorLinesNumber, setErrorLinesNumber] = useState<number[]>([]);
  const [isFocusing, setIsFocusing] = useState(false);

  useEffect(() => {
    if (countLine === 1) {
      setLines([1]);
    } else {
      const newLines: number[] = [];
      for (let i = 1; i <= countLine; i++) {
        newLines.push(i);
        setLines(newLines);
      }
    }
  }, [countLine]);

  useEffect(() => {
    setErrorLinesNumber(errorLines?.map((item) => item.line));
  }, [errorLines]);

  const handleOnChange = (e: any) => {
    onChange(e);
    const { value } = e.target;
    const count = value.split('\n').length;
    if (count > 1) setCountLine(count);
    else setCountLine(1);
  };

  const onFocus = () => {
    setIsFocusing(true);
  };

  const handleOnBlur = (e: any) => {
    setIsFocusing(false);
    onBlur(e);
  };

  return (
    <div
      className={cx('auto-line-textarea__wrapper', {
        'auto-line-textarea__wrapper--focusing': !!isFocusing,
        'auto-line-textarea__wrapper--error': errors && errors?.recipientsAmount,
      })}
    >
      <div className="auto-line-textarea__wrapper--child">
        <div className="auto-line-textarea__lines">
          {lines.map((item, index) => (
            <div
              className={cx({ 'auto-line-textarea__lines--error': errorLinesNumber?.includes(index + 1) })}
              key={index}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="auto-line-textarea__lines">
          {lines.map((item, index) => (
            <div
              key={index}
              className={cx('auto-line-textarea__dash', {
                'auto-line-textarea__lines--error': errorLinesNumber?.includes(index + 1),
              })}
            >
              -
            </div>
          ))}
        </div>
        <FormItem
          name={name}
          placeholder={placeholder}
          typeInput={TYPE_INPUT.TEXTAREA}
          maxLength={0}
          errors={errors}
          className="auto-line-textarea__edit"
          onChange={handleOnChange}
          showError={false}
          onBlur={handleOnBlur}
          innerRef={innerRef}
          onFocus={onFocus}
        />
      </div>
    </div>
  );
};

export default AutoLineTextArea;
