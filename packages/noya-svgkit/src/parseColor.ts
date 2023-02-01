export default function parseColor(value: string): {
  space: string;
  values: number[];
  alpha: number;
} {
  const parseColor = require('color-parse');

  return parseColor(value);
}
