export type ResponseEncoding = 'json' | 'text' | 'arrayBuffer';

export default async function fetchData(
  url: string,
  encoding: 'text',
): Promise<string>;

export default async function fetchData(
  url: string,
  encoding: 'arrayBuffer',
): Promise<ArrayBuffer>;

export default async function fetchData<T>(
  url: string,
  encoding: 'json',
): Promise<T>;

/**
 * Fetch from a url.
 *
 * If the response status code is >=400, throw an error.
 *
 * @param url
 */
export default async function fetchData<T>(
  url: string,
  encoding: ResponseEncoding,
): Promise<string | ArrayBuffer | T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  switch (encoding) {
    case 'text':
      return response.text();
    case 'arrayBuffer':
      return response.arrayBuffer();
    case 'json':
      return response.json();
  }
}
