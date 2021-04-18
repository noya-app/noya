export const sep = '/';

export function basename(filename: string) {
  return filename.slice(filename.lastIndexOf(sep) + 1);
}

export function dirname(filename: string) {
  const base = basename(filename);
  return filename.slice(0, -(base.length + 1));
}
