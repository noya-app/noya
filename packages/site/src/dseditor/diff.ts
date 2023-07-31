import cloneDeep from 'lodash/cloneDeep';
import { unique } from 'noya-utils';
import { Model } from './builders';
import { NoyaDiff, NoyaDiffItem } from './types';

export function equalPaths(a: string[], b: string[]) {
  return a.join('/') === b.join('/');
}

/**
 * Remove a class name from the `remove` list of a diff item. This can't be
 * done with `mergeClassNames` because there's nothing we can put in the diff
 * to represent the removal without also adding the class name to the `add`
 */
export function resetRemovedClassName(
  diff: NoyaDiff = Model.diff(),
  path: string[],
  className: string,
) {
  return Model.diff(
    diff.items
      .map((item) => {
        if (!equalPaths(item.path, path)) return item;

        return {
          ...item,
          classNames: mergeClassNames(
            {
              ...item.classNames,
              remove: item.classNames?.remove?.filter((c) => c !== className),
            },
            undefined,
          ),
        };
      })
      .filter((item) => !isEmptyDiffItem(item)),
  );
}

export function mergeClassNames(
  a: NoyaDiffItem['classNames'],
  b: NoyaDiffItem['classNames'],
): NoyaDiffItem['classNames'] {
  const { add: aAdd = [], remove: aRemove = [] } = a || {};
  const { add: bAdd = [], remove: bRemove = [] } = b || {};

  const add = [...aAdd, ...bAdd].filter(
    (className) => !aRemove.includes(className) && !bRemove.includes(className),
  );

  const remove = [...aRemove, ...bRemove].filter(
    (className) => !add.includes(className),
  );

  if (add.length === 0 && remove.length === 0) return undefined;

  return {
    ...(add.length > 0 && { add }),
    ...(remove.length > 0 && { remove }),
  };
}

export function mergeChildren(
  a: NoyaDiffItem['children'],
  b: NoyaDiffItem['children'],
): NoyaDiffItem['children'] {
  const { add: aAdd = [], remove: aRemove = [] } = a || {};
  const { add: bAdd = [], remove: bRemove = [] } = b || {};

  const add = [...aAdd, ...bAdd].filter(
    ({ node }) =>
      !aRemove.find((id) => node.id === id) &&
      !bRemove.find((id) => node.id === id),
  );

  const remove = unique(
    [...aRemove, ...bRemove].filter(
      (id) => !add.find(({ node }) => node.id === id),
    ),
  );

  if (add.length === 0 && remove.length === 0) return undefined;

  return {
    ...(add.length > 0 && { add }),
    ...(remove.length > 0 && { remove }),
  };
}

export function mergeDiffItems(
  a: NoyaDiffItem,
  b: NoyaDiffItem,
  path: string[] = [],
): NoyaDiffItem {
  const mergedItem = cloneDeep(a);

  if (a.textValue !== b.textValue) {
    mergedItem.textValue = b.textValue;
  }

  if (a.classNames) {
    mergedItem.classNames = mergeClassNames(a.classNames, b.classNames);
  }

  if (a.children) {
    mergedItem.children = cloneDeep(mergeChildren(a.children, b.children));
  }

  return mergedItem;
}

export function mergeDiffs(
  a: NoyaDiff = Model.diff(),
  b: NoyaDiff = Model.diff(),
  path: string[] = [],
): NoyaDiff {
  const itemsByPath: Record<string, NoyaDiffItem> = {};

  [...a.items, ...b.items].forEach((item) => {
    const key = item.path.join('/');
    const existingItem = itemsByPath[key];

    const newItem = existingItem
      ? mergeDiffItems(existingItem, item, path)
      : item;

    if (isEmptyDiffItem(newItem)) return;

    itemsByPath[key] = newItem;
  });

  return Model.diff(Object.values(itemsByPath));
}

function isEmptyClassNamesDiff(
  classNames: NoyaDiffItem['classNames'],
): boolean {
  const { add = [], remove = [] } = classNames || {};
  return add.length === 0 && remove.length === 0;
}

function isEmptyDiffItem(item: NoyaDiffItem) {
  return (
    item.textValue === undefined &&
    isEmptyClassNamesDiff(item.classNames) &&
    !item.children
  );
}
