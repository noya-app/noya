export function round(number: number, precision: number) {
  const base = Math.pow(10, precision);
  return Math.round((number + Number.EPSILON) * base) / base;
}
