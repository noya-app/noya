import type { TypedFile } from './types';

export function isSupportedFile<T extends string>(
  file: File,
  supportedFileTypes: T[],
): file is TypedFile<T> {
  return (
    supportedFileTypes.includes(file.type as T) ||
    (file.type === '' && file.name.endsWith('.sketch'))
  );
}
