function findAndParse<T>(text: string, start: string, end: string) {
  const startIndex = text.indexOf(start);
  const endIndex = text.lastIndexOf(end);
  const substring = text.slice(startIndex, endIndex + 1);

  try {
    return JSON.parse(substring) as T;
  } catch (e) {
    return null;
  }
}

// The response is a JSON array, potentially within other text.
// Slice a substring right before the first "[" and right after the last "]".
export function findAndParseJSONArray(text: string) {
  const parsed = findAndParse<unknown[]>(text, '[', ']');

  return Array.isArray(parsed) ? parsed : null;
}

// The response is a JSON object, potentially within other text.
// Slice a substring right before the first "{" and right after the last "}".
export function findAndParseJSONObject(text: string) {
  const parsed = findAndParse<Record<string, unknown>>(text, '{', '}');

  if (typeof parsed !== 'object' || Array.isArray(parsed)) return null;

  return parsed;
}
