const numberSuffixRegExp = /(.*?)(\s\d+)?$/;

export function getIncrementedName(
  originalName: string,
  names: string[],
): string {
  const [, prefix] = originalName.match(numberSuffixRegExp) || [];

  const number = [originalName, ...names]
    .filter((name) => name.startsWith(prefix))
    .map((name) => {
      const [, , number] = name.match(numberSuffixRegExp) || [];
      return parseInt(number || '1');
    })
    .sort()
    .pop();

  const parsedNumber = number ? number : 1;
  return `${prefix} ${parsedNumber + 1}`;
}
