export function sum(values: number[]) {
  let value = 0;

  for (let i = 0; i < values.length; i++) {
    value += values[i];
  }

  return value;
}
