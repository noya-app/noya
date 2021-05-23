export default function getMultiValue<T>(values: T[]): T | undefined {
  if (values.length === 1) {
    return values[0];
  } else if (values.length > 1) {
    const first = values[0];

    return values.every((v) => v === first) ? first : undefined;
  } else {
    return undefined;
  }
}
