import TIME_CONSTANTS from 'constants/time';
import moment from 'moment';

export const formatDateRequest = (value: number, format?: string) => {
  if (!value) return null;

  return moment(value).format(format || TIME_CONSTANTS.TIME_FORMAT.DATE_TIME);
};
