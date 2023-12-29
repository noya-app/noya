export type ArrayDiffItem<T> =
  | [type: 'a', item: T, to: number]
  | [type: 'r', from: number | string]
  | [type: 'm', from: number, to: number];

export function added<T>(item: T, to: number): ArrayDiffItem<T> {
  return ['a', item, to];
}

export function removed<T>(from: number | string): ArrayDiffItem<T> {
  return ['r', from];
}

export function moved<T>(from: number, to: number): ArrayDiffItem<T> {
  return ['m', from, to];
}

/**
 * Assuming arrays of equal lengths, find the first move in the array.
 */
function computeFirstArrayMove<T>(
  startIndex: number,
  a: T[],
  b: T[],
  identity: (item: T) => unknown = (item) => item,
): [number, ArrayDiffItem<T>] | undefined {
  for (let i = startIndex; i < a.length; i++) {
    if (identity(a[i]) !== identity(b[i])) {
      return [
        i,
        moved(
          i,
          b.findIndex((item) => identity(item) === identity(a[i])),
        ),
      ];
    }
  }
}

function filterDuplicates<T>(
  a: T[],
  identity: (item: T) => unknown = (item) => item,
): T[] {
  const map = new Map(a.map((item, index) => [identity(item), index]));

  return [...map.values()].map((index) => a[index]);
}

export function computeArrayDiff(
  a: string[],
  b: string[],
): ArrayDiffItem<string>[];
export function computeArrayDiff<T>(
  a: T[],
  b: T[],
  identity: (item: T) => string,
  options?: { removalMode?: 'key' | 'index' },
): ArrayDiffItem<T>[];
export function computeArrayDiff<T>(
  a: T[],
  b: T[],
  identity: (item: T) => string = (item) => item as string,
  options: { removalMode?: 'key' | 'index' } = {},
): ArrayDiffItem<T>[] {
  const items: ArrayDiffItem<T>[] = [];
  const aMap = new Map(a.map((item, index) => [identity(item), index]));
  const bMap = new Map(b.map((item, index) => [identity(item), index]));

  // Detect duplicates by comparing array length vs map size.
  if (aMap.size !== a.length || bMap.size !== b.length) {
    return computeArrayDiff(
      filterDuplicates(a, identity),
      filterDuplicates(b, identity),
      identity,
      options,
    );
  }

  // Check for removed items.
  let removalOffset = 0;
  for (let i = 0; i < a.length; i++) {
    const item = a[i];
    const itemIdentity = identity(item);
    if (!bMap.has(itemIdentity)) {
      items.push(
        removed(
          options.removalMode === 'key' ? itemIdentity : i - removalOffset,
        ),
      );
      removalOffset++;
    }
  }

  // Check for added items.
  for (let i = 0; i < b.length; i++) {
    const item = b[i];
    if (!aMap.has(identity(item))) {
      items.push(added(item, i));
    }
  }

  let result = applyArrayDiff(a, items, identity);
  let firstMove = computeFirstArrayMove(0, result, b, identity);
  while (firstMove) {
    items.push(firstMove[1]);
    result = applyArrayDiff(result, [firstMove[1]], identity);
    firstMove = computeFirstArrayMove(firstMove[0], result, b, identity);
  }

  return items;
}

function getIndex<T>(
  items: T[],
  indexOrKey: number | string,
  identity: (item: T) => string,
): number {
  return typeof indexOrKey === 'number'
    ? indexOrKey
    : items.findIndex((item) => indexOrKey === identity(item));
}

export function applyArrayDiff(
  a: string[],
  items: ArrayDiffItem<string>[],
): string[];
export function applyArrayDiff<T>(
  a: T[],
  items: ArrayDiffItem<T>[],
  identity: (item: T) => string,
): T[];
export function applyArrayDiff<T>(
  a: T[],
  items: ArrayDiffItem<T>[],
  identity: (item: T) => string = (item) => item as string,
): T[] {
  let result = [...a];

  for (const item of items) {
    switch (item[0]) {
      case 'a':
        result.splice(item[2], 0, item[1]);
        break;
      case 'r':
        result.splice(getIndex(result, item[1], identity), 1);
        break;
      case 'm':
        const [movedItem] = result.splice(item[1], 1);
        result.splice(item[2], 0, movedItem);
        break;
    }
  }

  return result;
}

export function mapArrayDiff<T, K>(
  items: ArrayDiffItem<T>[],
  map: (item: T) => K,
): ArrayDiffItem<K>[] {
  return items.map((item) => {
    switch (item[0]) {
      case 'a':
        return added(map(item[1]), item[2]);
      case 'r':
        return removed(item[1]);
      case 'm':
        return moved(item[1], item[2]);
      default:
        throw new Error(`Invalid diff item type: ${item[0]}`);
    }
  });
}

export function describeDiffItem<T>(
  item: ArrayDiffItem<T>,
  getLabel: (item: T) => string,
): string {
  switch (item[0]) {
    case 'a':
      return `+${getLabel(item[1])}`;
    case 'r':
      return `-${item[1]}`;
    case 'm':
      return `-${item[1]} -> +${item[2]}`;
  }
}
