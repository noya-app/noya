export type ArrayDiffItem<T> =
  | [type: 'a', item: T, to: number]
  | [type: 'r', from: number]
  | [type: 'm', from: number, to: number];

export function added<T>(item: T, to: number): ArrayDiffItem<T> {
  return ['a', item, to];
}

export function removed<T>(from: number): ArrayDiffItem<T> {
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

export function computeArrayDiff<T>(a: T[], b: T[]): ArrayDiffItem<T>[];
export function computeArrayDiff<T, K>(
  a: T[],
  b: T[],
  identity: (item: T) => K,
): ArrayDiffItem<T>[];
export function computeArrayDiff<T>(
  a: T[],
  b: T[],
  identity: (item: T) => unknown = (item) => item,
): ArrayDiffItem<T>[] {
  const items: ArrayDiffItem<T>[] = [];
  const aMap = new Map(a.map((item, index) => [identity(item), index]));
  const bMap = new Map(b.map((item, index) => [identity(item), index]));

  // Check for removed items.
  let removalOffset = 0;
  for (let i = 0; i < a.length; i++) {
    const item = a[i];
    if (!bMap.has(identity(item))) {
      items.push(removed(i - removalOffset));
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

  let result = applyArrayDiff(a, items);
  let firstMove = computeFirstArrayMove(0, result, b, identity);
  while (firstMove) {
    items.push(firstMove[1]);
    result = applyArrayDiff(result, [firstMove[1]]);
    firstMove = computeFirstArrayMove(firstMove[0], result, b, identity);
  }

  return items;
}

export function applyArrayDiff<T>(a: T[], items: ArrayDiffItem<T>[]): T[] {
  let result = [...a];

  for (const item of items) {
    switch (item[0]) {
      case 'a':
        result.splice(item[2], 0, item[1]);
        break;
      case 'r':
        result.splice(item[1], 1);
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
