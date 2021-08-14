export function unique<T>(array: T[]) {
  return [...new Set(array)];
}
