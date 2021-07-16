/**
 * Round to precision, if necessary.
 *
 * Examples:
 * - round(1.111, 2) => 1.11
 * - round(1.115, 2) => 1.12
 * - round(1, 2) => 1
 *
 * https://stackoverflow.com/a/11832950
 */
export function round(number: number, precision: number = 0) {
  const base = Math.pow(10, precision);
  return Math.round((number + Number.EPSILON) * base) / base;
}
