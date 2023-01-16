export const trimSpace = (str: string) => {
  if (!str) return { resultString: '', count: 0 };
  const strArr = str
    .replaceAll('"', '')
    .split('\n')
    .filter((item) => item !== '');

  const result = strArr
    .map((line) => {
      return line.replaceAll(/[ ]*[\,][ ]*/g, ',').trim();
    })
    .join('\n');
  return { resultString: result, count: strArr.length };
};

export const trimSpaceStartEnd = (str: string) => {
  if (!str) return { count: 0, str };
  const strArr = str
    .replaceAll('"', '')
    .split('\n')
    .filter((item) => item !== '');
  const count = strArr.length;

  const newStr = strArr.map((line) => line.trim()).join('\n');
  return { count, newStr };
};
