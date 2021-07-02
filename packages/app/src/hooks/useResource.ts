import fetchData, { ResponseEncoding } from '../utils/fetchData';
import { SuspendedValue } from 'noya-utils';

export const resourceCache: { [key: string]: SuspendedValue<any> } = {};

/**
 * Fetch JSON from a url.
 *
 * The response will be cached forever using the url as a key.
 *
 * @param url
 */
export function useResource<T>(url: string, encoding: ResponseEncoding): T {
  if (!(url in resourceCache)) {
    resourceCache[url] = new SuspendedValue<T>(
      (fetchData as any)(url, encoding),
    );
  }

  return resourceCache[url].getValueOrThrow();
}
