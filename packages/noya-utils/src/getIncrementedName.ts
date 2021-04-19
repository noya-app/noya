const numberSuffixRegExp = /(\s\d+)$/;

export function getIncrementedName(name: string): string {
  const hasNumber = name.match(numberSuffixRegExp);
  const number = hasNumber ? parseInt(hasNumber.shift() || '0') : 0;

  const newName = number
    ? name.replace(numberSuffixRegExp, ' ' + (number + 1).toString())
    : name + ' 2';

  return newName;
}
