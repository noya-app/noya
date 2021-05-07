export default function getMultiValue<T>(values: T[]): boolean {
  if (values.length === 0) return true;

  const first = values[0];

  return values.every((value) => value === first);
}
