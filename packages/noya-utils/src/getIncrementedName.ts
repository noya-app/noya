const numberSuffixRegExp = /(.*?)(\s\d+)?$/;

export function getIncrementedName(
  originalName: string,
  names: string[],
): string {
  const [, prefix] = originalName.match(numberSuffixRegExp) || [];

  const numbers = [originalName, ...names]
    .filter((name) => name.startsWith(prefix))
    .map((name) => {
      const [, , number] = name.match(numberSuffixRegExp) || [];
      return parseInt(number || '1');
    })
    .sort();

  const maxNumber = numbers[numbers.length - 1];
  return `${prefix} ${maxNumber + 1}`;
}
