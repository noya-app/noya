// Loosely based on:
// https://github.com/apple/swift-algorithms/blob/0e2941ef50e7ebdf165150e3959453330946fd7d/Sources/Algorithms/Chunked.swift#L236
export function chunkBy<T>(
  values: T[],
  belongInSameGroup: (a: T, b: T) => boolean,
): T[][] {
  if (values.length === 0) return [];

  const result: T[][] = [];

  let start = 0;
  const end = values.length;

  for (let i = start + 1; i < end; i++) {
    const prev = values[i - 1];
    const next = values[i];

    if (!belongInSameGroup(prev, next)) {
      result.push(values.slice(start, i));
      start = i;
    }
  }

  result.push(values.slice(start, end));

  return result;
}
