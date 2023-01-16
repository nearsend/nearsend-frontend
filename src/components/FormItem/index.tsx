import { memo, FC, Fragment, useEffect, useState } from 'react';
import { Field, ErrorMessage, FieldInputProps, FieldConfig, FormikProps } from 'formik';
import { Input, Select, Checkbox, Switch, DatePicker, Radio, AutoComplete, Tooltip } from 'antd';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import trim from 'lodash/trim';

import EyeInvisibleIcon from 'resources/svg/EyeInvisibleIcon';
import EyeIcon from 'resources/svg/EyeIcon';
import IconCalendar from 'resources/svg/CalendarIcon';

import InfinityScrollSelect from 'components/InfinityScrollSelect';
import NumberFormat from 'components/NumberFormat';

import LENGTH_CONSTANTS from 'constants/length';
import validate from 'utils/validate';
import IconHelp from 'resources/svg/IconHelp';
import IconDropdown from 'resources/svg/IconDropdown';
import TIME_CONSTANTS from 'constants/time';
import UploadComponent from 'components/Upload';

const { Password, Search, TextArea } = Input;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

const levelPassword = [
  { level: 0, text: 'common.low' },
  { level: 1, text: 'common.low' },
  { level: 2, text: 'common.medium' },
  { level: 3, text: 'common.high' },
  { level: 4, text: 'common.high' },
];

export const TYPE_INPUT = {
  TEXT: 'TEXT',
  TEXTAREA: 'TEXTAREA',
  DATE: 'DATE',
  PASSWORD: 'PASSWORD',
  SELECT: 'SELECT',
  CHECKBOX: 'CHECKBOX',
  CHECKBOXGROUP: 'CHECKBOXGROUP',
  NUMBER: 'NUMBER',
  SEARCH: 'SEARCH',
  SELECT_INFINITY_SCROLL: 'SELECT_INFINITY_SCROLL',
  SWITCH: 'SWITCH',
  RADIO: 'RADIO',
  AUTOCOMPLETE: 'AUTOCOMPLETE',
  UPLOAD: 'UPLOAD',
};

export const AutoCompleteInput: FC<{
  field: FieldInputProps<any>;
  form: FormikProps<any>;
  placeholder: string;
  onChange?: any;
  onBlur?: any;
  props: any;
}> = ({ field, form, placeholder, ...props }) => {
  const { onChange, onBlur } = props;

  const handleChange = (val: any) => {
    if (onChange) {
      onChange({ form, field, val });
    } else {
      form.setFieldValue(field.name, val);
    }
  };

  const handleBlur = (e: any) => {
    const { value } = e.target;

    if (!onBlur) {
      form.handleBlur(e);
      form.setFieldValue(field.name, trim(value));
    } else {
      onBlur(e);
    }
  };

  return (
    <AutoComplete {...field} {...props} onChange={handleChange} onBlur={handleBlur} showArrow>
      <Input {...props} {...field} placeholder={placeholder} onBlur={handleBlur} />
    </AutoComplete>
  );
};

export const TextInput: FC<{
  field: FieldInputProps<any>;
  form: FormikProps<any>;
  props: any;
  onChange?: any;
  onBlur?: any;
}> = ({ field, form, ...props }) => {
  const { onChange, onBlur } = props as any;
  const handleChange = (e: any) => {
    const { value } = e.target;
    if (!onChange) {
      form.setFieldValue(field.name, value);
    } else {
      onChange(e);
    }
  };

  const handleBlur = (e: any) => {
    const { value } = e.target;
    if (!onBlur) {
      form.handleBlur(e);
      form.setFieldValue(field.name, trim(value));
    } else {
      onBlur(e);
    }
  };

  return (
    <Input
      maxLength={LENGTH_CONSTANTS.MAX_LENGTH_INPUT}
      {...field}
      {...props}
      onChange={handleChange}
      onBlur={handleBlur}
      value={form.values[field.name]}
    />
  );
};

export const InputTextArea: FC<{
  field: FieldInputProps<any>;
  form: FormikProps<any>;
  innerRef: any;
  props: any;
}> = ({ field, form, innerRef, ...props }) => {
  const { onChange, onBlur } = props as any;
  const handleChange = (e: any) => {
    const { value } = e.target;
    if (!onChange) {
      form.setFieldValue(field.name, value);
    } else {
      onChange(e);
    }
  };

  const handleBlur = (e: any) => {
    const { value } = e.target;
    if (!onBlur) {
      form.handleBlur(e);
      form.setFieldValue(field.name, trim(value));
    } else {
      onBlur(e);
    }
  };

  return (
    <div className="text-area">
      <TextArea
        rows={5}
        {...field}
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
        value={form.values[field.name]}
        ref={innerRef}
      />
    </div>
  );
};

export const InputDate: FC<{
  field: FieldInputProps<any>;
  form: FormikProps<any>;
  props: any;
  value?: any;
}> = ({ field, form, value, ...props }) => {
  const { onChange, disabledDate } = props as any;

  const handleDisabledDate = (current: any) => {
    if (disabledDate) {
      return disabledDate(current, form);
    }

    return false;
  };

  const handleChange = (value: any) => {
    if (!onChange) {
      form.setFieldValue(field.name, value);
    } else {
      onChange({ form, field, value });
    }
  };

  return (
    <DatePicker
      inputReadOnly
      {...field}
      {...props}
      suffixIcon={<IconCalendar />}
      getPopupContainer={(trigger: any) => trigger.parentElement}
      onChange={handleChange}
      value={value || field.value}
      disabledDate={handleDisabledDate}
      format={TIME_CONSTANTS.TIME_FORMAT.DATE_ANTD}
    />
  );
};

export const NumberInput: FC<{
  field: FieldInputProps<any>;
  props: any;
  form: FormikProps<any>;
  unit: string;
  thousandSeparator?: boolean;
  onChange?: any;
  onValueChange?: any;
}> = ({ field, form, unit, thousandSeparator, onChange, onValueChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<any>) => {
    if (thousandSeparator) {
      return;
    } else {
      field.onChange(e);
    }
  };

  const handleValueChange = (values: any) => {
    if (thousandSeparator) {
      form.setFieldValue(field.name, values?.value);
    }
  };

  return (
    <Fragment>
      <NumberFormat
        allowNegative={false}
        customInput={Input}
        thousandSeparator={thousandSeparator}
        onValueChange={onValueChange ?? handleValueChange}
        {...field}
        {...props}
        onChange={onChange ?? handleChange}
      />
      {unit && <span className="unit">{unit}</span>}
    </Fragment>
  );
};

export const SearchInput: FC<{
  field: FieldInputProps<any>;
  form: FormikProps<any>;
  props: any;
}> = ({ field, form, ...props }) => {
  return <Search {...field} {...props} />;
};

export const PasswordInput: FC<{
  field: FieldInputProps<any>;
  props: any;
  showLevelPassword?: boolean;
  label?: any;
  labelClassName?: string;
  required?: boolean;
  form: FormikProps<any>;
}> = ({ required, field, showLevelPassword, label, labelClassName, form, ...props }) => {
  const fieldVal = field.value;
  const addClassLevel =
    validate.passwordStrength(fieldVal) < 2
      ? 'input__label--low'
      : validate.passwordStrength(fieldVal) < 3
      ? 'input__label--medium'
      : validate.passwordStrength(fieldVal) < 5
      ? 'input__label--high'
      : '';
  const { t } = useTranslation('common');
  return (
    <>
      {label && showLevelPassword && (
        <div className={cx('form-item__label', labelClassName)}>
          {!!fieldVal && !!showLevelPassword && (
            <div className="input__label--level">
              {levelPassword.map((item) => (
                <span
                  className={`input__label--level-item ${
                    item.level <= validate.passwordStrength(fieldVal) && addClassLevel
                  }`}
                  key={item.level}
                />
              ))}
              <span className={`input__label--level-title ${addClassLevel}`}>
                {t(levelPassword.filter((item) => item.level === validate.passwordStrength(fieldVal))[0]?.text)}
              </span>
            </div>
          )}
        </div>
      )}
      <Password iconRender={(visible) => (!visible ? <EyeInvisibleIcon /> : <EyeIcon />)} {...field} {...props} />
    </>
  );
};

export const SelectInput: FC<{
  field: FieldInputProps<any>;
  props: FieldConfig;
  form: FormikProps<any>;
  options: {
    value: any;
    name: any;
  }[];
  prefix?: any;
  className?: string;
  onChange?: any;
  mode?: any;
  values?: any;
  optionsType?: any;
  enableAllOption?: any;
  placeholder?: string;
  optionsRenderProps?: any;
  suffixIcon?: any;
}> = ({
  field,
  form,
  options,
  prefix,
  className,
  onChange,
  optionsType,
  enableAllOption,
  placeholder,
  optionsRenderProps,
  suffixIcon,
  ...props
}) => {
  const { t } = useTranslation();

  const ALL_OPTIONS = 'all-options';
  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);
  const { value } = field;

  useEffect(() => {
    setIndeterminate(!!value && !!value.length && value.length < options.length);
    setCheckAll(!!value && !!value.length && value.length === options.length);
  }, [value]);

  const onCheckAllOptions = (event: any) => {
    const { checked } = event.target;
    let values = [];
    if (checked) {
      values = options.map((option) => option.value);
    } else {
      values = [];
    }
    setIndeterminate(false);
    setCheckAll(checked);
    onChangeSelect(values);
  };

  const optionsSelectAllRender = () => {
    switch (optionsType) {
      case TYPE_INPUT.CHECKBOX: {
        return (
          <div className="search-form__all-options">
            <Checkbox onChange={onCheckAllOptions} id={ALL_OPTIONS} indeterminate={indeterminate} checked={checkAll}>
              {t('common.all')}
            </Checkbox>
          </div>
        );
      }
      default: {
        return null;
      }
    }
  };

  const optionsRender = (item: any) => {
    if (optionsRenderProps) {
      return optionsRenderProps(item);
    }
    switch (optionsType) {
      case TYPE_INPUT.CHECKBOX: {
        return (
          <Checkbox id={item.value} checked={value && value.indexOf(item.value) >= 0}>
            <div onClick={onPreventMouseDown}>{t(item.name)}</div>
          </Checkbox>
        );
      }
      default: {
        return t(item.name);
      }
    }
  };

  const onPreventMouseDown = (event: any) => {
    event.stopPropagation();
  };

  const onChangeSelect = (val: any) => {
    if (onChange) {
      onChange({ form, field, val });
    } else {
      form.setFieldValue(field.name, val);
    }
  };

  return (
    <div className={cx('ant-select-wrapper', className)}>
      {prefix}
      <Select
        {...field}
        {...props}
        placeholder={placeholder}
        onChange={onChangeSelect}
        getPopupContainer={(trigger: any) => trigger.parentElement}
        notFoundContent={null}
        suffixIcon={suffixIcon || <IconDropdown />}
        dropdownRender={(menu) => {
          return (
            <Fragment>
              {enableAllOption && options.length > 1 && optionsSelectAllRender()}
              {menu}
            </Fragment>
          );
        }}
      >
        {options.map((item: any) => (
          <Option value={item.value} key={item?.key || item.value} label={item.name}>
            {optionsRender(item)}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export const CheckboxInput: FC<{
  field: FieldInputProps<any>;
  props: any;
  form: FormikProps<any>;
  content: any;
  checked?: boolean;
}> = ({ field, content, form, checked, ...props }) => (
  <Checkbox {...field} {...props} checked={checked ?? field.value}>
    {content}
  </Checkbox>
);

export const CheckboxGroupInput: FC<{
  field: FieldInputProps<any>;
  props: any;
  form: FormikProps<any>;
  options: any;
  feildNameChange: any;
  onChangeValue: any;
  onChange: any;
  enableAllOption: boolean;
}> = ({ field, form, options, onChange, enableAllOption, ...props }) => {
  const { t } = useTranslation();

  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);

  const handleChange = (value: any) => {
    if (onChange) {
      onChange(value);
    } else {
      if (field.value.includes(value)) {
      } else {
        form.setFieldValue(field.name, [...value]);
        form.setFieldValue(props?.feildNameChange, props?.onChangeValue);
      }
    }

    setIndeterminate(!!value.length && value.length < options.length);
    setCheckAll(value.length === options.length);
  };

  useEffect(() => {
    setIndeterminate(!!field.value?.length && field.value?.length < options.length);
    setCheckAll(field.value?.length === options.length);
  }, [field]);

  const onCheckAllChange = (e: any) => {
    handleChange(e.target.checked ? options.map(({ value }: any) => value) : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  return (
    <div className="form-item__checkbox-wrapper">
      {enableAllOption && (
        <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
          {t('common.all')}
        </Checkbox>
      )}
      <CheckboxGroup
        options={options.map((e: any) => ({ ...e, label: t(e.name) }))}
        value={field.value}
        {...props}
        onChange={handleChange}
      />
    </div>
  );
};

export const SwitchInput: FC<{
  field: FieldInputProps<any>;
  props: any;
  form: FormikProps<any>;
}> = ({ field, form, ...props }) => {
  const onChange = (checked: boolean) => {
    form.setFieldValue(field.name, checked);
  };
  return <Switch {...field} {...props} checked={!!field.value} onChange={onChange} />;
};

export const RadioInput: FC<{
  field: FieldInputProps<any>;
  props: any;
  form: FormikProps<any>;
  options: {
    value: any;
    name: any;
  }[];
}> = ({ field, form, options, ...props }) => {
  const { onChange } = props as any;
  const handleChange = (e: any) => {
    if (!onChange) {
      form.setFieldValue(field.name, e.target.value);
    } else {
      onChange(e);
    }
  };

  return (
    <Radio.Group onChange={handleChange} value={field.value}>
      {options.map((e: { value: any; name: any }) => (
        <Radio key={e.value} value={e.value}>
          {e.name}
        </Radio>
      ))}
    </Radio.Group>
  );
};

type FormItemType = {
  component?: any;
  type?: string;
  name: string;
  typeInput?: string | null;
  prefix?: any;
  placeholder?: any;
  options?: {
    value: any;
    name: any;
    key?: any;
  }[];
  subLabel?: any;
  popupClassName?: string;
  className?: string;
  content?: any;
  label?: any;
  showLevelPassword?: boolean;
  maxLength?: number;
  onChange?: any;
  showSearch?: boolean;
  filterOption?: any;
  dropdownMatchSelectWidth?: any;
  labelClassName?: string;
  containerClassName?: string;
  errorClassName?: string;
  decimalScale?: number;
  autoFocus?: boolean;
  required?: boolean;
  children?: any;
  inputProps?: any;
  mode?: any;
  showArrow?: any;
  maxTagCount?: any;
  maxTagTextLength?: any;
  onSearch?: any;
  onKeyDown?: any;
  tagRender?: any;
  optionLabelProp?: any;
  values?: any;
  optionsType?: any;
  enableAllOption?: any;
  errorField?: string;
  description?: any;
  fetchData?: any;
  renderOption?: any;
  limit?: string | number;
  getPopupContainer?: any;
  value?: any;
  disabled?: boolean;
  unit?: string;
  thousandSeparator?: boolean;
  onValueChange?: any;
  onBlur?: any;
  isAllowed?: any;
  enterButton?: any;
  virtual?: boolean;
  rows?: number;
  validate?: any;
  format?: any;
  disabledDate?: any;
  allowClear?: boolean;
  showTime?: any;
  showNow?: boolean;
  showCount?: boolean;
  feildNameChange?: any;
  onChangeValue?: any;
  defaultValue?: any;
  suffix?: any;
  labelTootip?: any;
  disabledTime?: any;
  autoSize?: any;
  checked?: boolean;
  inputReadOnly?: boolean;
  optionsRenderProps?: any;
  suffixIcon?: any;
  showError?: boolean;
  helpText?: string;
  errors?: any;
  fileTypeErrorMessage?: string;
  searchValue?: string;
  open?: any;
  onDropdownVisibleChange?: any;
  innerRef?: any;
  onSelect?: any;
  onFocus?: any;
};

const FormItem = ({
  component,
  placeholder,
  type,
  name,
  typeInput = TYPE_INPUT.TEXT,
  prefix,
  popupClassName,
  className,
  content,
  label,
  labelClassName,
  containerClassName,
  errorClassName,
  required,
  children,
  errorField,
  description,
  disabled,
  unit,
  validate,
  labelTootip,
  subLabel,
  showError = true,
  helpText,
  errors,
  fileTypeErrorMessage,
  ...props
}: FormItemType) => {
  let componentRender: any = component || TextInput;

  switch (typeInput) {
    case TYPE_INPUT.TEXT:
      componentRender = TextInput;
      break;
    case TYPE_INPUT.TEXTAREA:
      componentRender = InputTextArea;
      break;
    case TYPE_INPUT.DATE:
      componentRender = InputDate;
      break;
    case TYPE_INPUT.PASSWORD:
      componentRender = PasswordInput;
      break;
    case TYPE_INPUT.SELECT:
      componentRender = SelectInput;
      break;
    case TYPE_INPUT.CHECKBOX:
      componentRender = CheckboxInput;
      break;
    case TYPE_INPUT.CHECKBOXGROUP:
      componentRender = CheckboxGroupInput;
      break;
    case TYPE_INPUT.NUMBER:
      componentRender = NumberInput;
      break;
    case TYPE_INPUT.SEARCH:
      componentRender = SearchInput;
      break;
    case TYPE_INPUT.SELECT_INFINITY_SCROLL:
      componentRender = InfinityScrollSelect;
      break;
    case TYPE_INPUT.SWITCH:
      componentRender = SwitchInput;
      break;
    case TYPE_INPUT.RADIO:
      componentRender = RadioInput;
      break;
    case TYPE_INPUT.AUTOCOMPLETE:
      componentRender = AutoCompleteInput;
      break;
    case TYPE_INPUT.UPLOAD:
      componentRender = UploadComponent;
      break;
  }
  const propsField: any = {
    prefix,
    placeholder,
    className,
    content,
    disabled,
    ...props,
  };
  if (typeInput === TYPE_INPUT.SELECT || typeInput === TYPE_INPUT.SELECT_INFINITY_SCROLL) {
    propsField.popupClassName = popupClassName;
  }
  if (typeInput === TYPE_INPUT.PASSWORD) {
    propsField.labelClassName = labelClassName;
  }
  if (typeInput === TYPE_INPUT.UPLOAD) {
    propsField.content = content;
    propsField.fileTypeErrorMessage = fileTypeErrorMessage;
  }

  return (
    <div
      className={cx(containerClassName, 'form-item', {
        'has-error': !!errors?.[name],
      })}
    >
      {label && (
        <div className={cx(labelClassName, 'form-item__label')}>
          {label}
          {required ? ' *' : ''} {labelTootip ?? ''}
          {helpText && (
            <Tooltip trigger="hover" title={helpText} overlayClassName="tooltip-detail">
              <span>
                <IconHelp />
              </span>
            </Tooltip>
          )}
        </div>
      )}
      {subLabel && <p className="text--red">{subLabel}</p>}
      {description && <div className={cx(labelClassName, 'form-item__description')}>{description}</div>}
      <Field
        type={type}
        name={name}
        placeholder={placeholder}
        label={label}
        component={componentRender}
        unit={unit}
        validate={validate}
        {...propsField}
      />
      {showError && (
        <ErrorMessage name={errorField || name} component="div" className={cx('error-text', errorClassName)} />
      )}
      {children}
    </div>
  );
};

export default memo(FormItem);
