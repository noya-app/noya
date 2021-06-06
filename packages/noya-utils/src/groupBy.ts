export function groupBy<T, U extends PropertyKey>(
  values: T[],
  projection: (value: T) => U,
) {
  const result: { [key in PropertyKey]: T[] } = {};

  values.forEach((value) => {
    const key = projection(value);

    if (key in result) {
      result[key].push(value);
    } else {
      result[key] = [value];
    }
  });

  return result;
}
