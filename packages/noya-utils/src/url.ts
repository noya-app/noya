const externalLinkRE = /https?:/;

export function isExternalUrl(url: string): boolean {
  return !!externalLinkRE.exec(url);
}

export function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('/');
}

/**
 * Parses a url, returning a pathname, query, and fragment.
 *
 * The query and fragment do not include a leading "?" or "#".
 *
 * @param url
 */
export function parseUrl(url: string) {
  const normalized = isExternalUrl(url)
    ? url
    : isAbsoluteUrl(url)
    ? `http://a.com${url}`
    : `http://a.com/${url}`;

  const { pathname, search, hash } = new URL(normalized);

  return { pathname, query: search.slice(1), fragment: hash.slice(1) };
}

export function decodeQueryParameters(
  encodedParameters: string,
): Record<string, string> {
  if (!encodedParameters) return {};

  const params = encodedParameters.split('&').reduce((params, item) => {
    const [key, value] = item.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value);
    return params;
  }, {} as Record<string, string>);

  return params;
}

export function encodeQueryParameters(
  parameters: Record<string, string | number | boolean>,
) {
  const encoded = [];

  for (const key in parameters) {
    encoded.push(`${key}=${encodeURIComponent(parameters[key])}`);
  }

  return encoded.join('&');
}
