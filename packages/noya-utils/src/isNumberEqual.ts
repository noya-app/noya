// The built-in Number.EPSILON is too small for some of our calculations.
// Possibly this is due to conversion to/from sketch files or wasm, or
// because we multiply/divide which compounds this error
export function isNumberEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}
