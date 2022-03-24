import { delimitedPath } from 'noya-utils';

export function parseFilename(uri: string) {
  const basename = delimitedPath.basename(uri);
  const [name, extension] = basename.split('.');

  return {
    name,
    extension: extension as 'png' | 'jpg' | 'webp' | 'pdf',
  };
}
