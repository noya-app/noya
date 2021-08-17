// TODO: Review this. Is it a good approach for Noya?
export function memoize<I extends unknown[], O>(
  f: (...values: I) => O,
): (...values: I) => O {
  const intermediateCache = new Map<I[number], string>();
  const cache: Map<string, O> = new Map();
  let intermediateCacheIndex = 0;

  return (...values: I): O => {
    let key = '';

    for (let value of values) {
      // Assign each argument value a unique index
      if (!intermediateCache.has(value)) {
        intermediateCache.set(value, `${intermediateCacheIndex++}`);
      }

      // Assemble a cache key from the combined indexes
      key += intermediateCache.get(value)! + ':';
    }

    if (!cache.has(key)) {
      cache.set(key, f(...values));
    }

    return cache.get(key)!;
  };
}
