export default function getMultiValue(values: number[]): number | undefined {
  if (values.length === 1) {
    return values[0];
  } else if (values.length > 1) {
    const min = Math.min(...values);
    const max = Math.max(...values);

    return max - min < Number.EPSILON ? min : undefined;
  } else {
    return undefined;
  }
}
