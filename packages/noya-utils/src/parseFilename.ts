import * as delimitedPath from './delimitedPath';

/**
 * File path parser used in react native app
 */
export function parseFilename(uri: string) {
  const basename = delimitedPath.basename(uri);
  const [name, extension] = basename.split('.');

  return {
    name,
    extension: extension as 'png' | 'jpg' | 'webp' | 'pdf',
  };
}
