export const numberSuffixRegExp = /(.*?)(\s\d+)?$/;

export function getIncrementedName(name: string): string {
  const [, prefix, number] = name.match(numberSuffixRegExp) || [];
  const parsedNumber = number ? parseInt(number) : 1;
  return `${prefix} ${parsedNumber + 1}`;
}
