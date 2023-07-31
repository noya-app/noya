import cloneDeep from 'lodash/cloneDeep';
import { unique } from 'noya-utils';
import { Model } from './builders';
import { NoyaDiff, NoyaDiffItem } from './types';

function classNameReducer(
  classNames: NoyaDiffItem['classNames'],
  action: Action,
): NoyaDiffItem['classNames'] {
  const { add = [], remove = [] } = classNames || {};

  switch (action[0]) {
    case 'removeClassName': {
      const [, { className }] = action;

      return {
        add: add.filter((name) => name !== className),
        remove: [...remove, className],
      };
    }
    case 'resetRemovedClassName': {
      const [, { className }] = action;

      return {
        add,
        remove: remove.filter((name) => name !== className),
      };
    }
  }

  return classNames;
}

type Action =
  | [type: 'updateTextValue', options: { path: string[]; value: string }]
  | [type: 'removeClassName', options: { path: string[]; className: string }]
  | [
      type: 'resetRemovedClassName',
      options: { path: string[]; className: string },
    ];

const emptyDiff: NoyaDiff = {
  items: [],
};

export function diffReducer(
  diff: NoyaDiff = emptyDiff,
  action: Action,
): NoyaDiff {
  switch (action[0]) {
    case 'updateTextValue': {
      const [, { path, value }] = action;

      const existingItem = cloneDeep(
        getItem(diff, path) ?? Model.diffItem({ path }),
      );

      const newDiff: NoyaDiff = {
        ...diff,
        items: replaceOrAdd(
          diff.items,
          Model.diffItem({ ...existingItem, textValue: value }),
        ),
      };

      return newDiff;
    }
    case 'removeClassName': {
      const [, { path }] = action;

      const existingItem = cloneDeep(
        getItem(diff, path) ?? Model.diffItem({ path }),
      );

      const newDiff: NoyaDiff = {
        ...diff,
        items: replaceOrAdd(
          diff.items,
          Model.diffItem({
            ...existingItem,
            classNames: classNameReducer(existingItem.classNames, action),
          }),
        ),
      };

      return newDiff;
    }
    case 'resetRemovedClassName': {
      const [, { path }] = action;

      const existingItem = cloneDeep(
        getItem(diff, path) ?? Model.diffItem({ path }),
      );

      const newDiff: NoyaDiff = {
        ...diff,
        items: replaceOrAdd(
          diff.items,
          Model.diffItem({
            ...existingItem,
            classNames: classNameReducer(existingItem.classNames, action),
          }),
        ),
      };

      return newDiff;
    }
  }
}

function getItem(diff: NoyaDiff, path: string[]): NoyaDiffItem | undefined {
  return diff.items.find((item) => item.path.join('/') === path.join('/'));
}

export function equalPaths(a: string[], b: string[]) {
  return a.join('/') === b.join('/');
}

function replaceOrAdd(array: NoyaDiffItem[], newItem: NoyaDiffItem) {
  const index = array.findIndex((item) => equalPaths(item.path, newItem.path));

  const newArray =
    index === -1
      ? [...array, newItem]
      : array.map((item, i) => (i === index ? newItem : item));

  return newArray.sort((a, b) =>
    a.path.join('/').localeCompare(b.path.join('/')),
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

    if (existingItem) {
      itemsByPath[key] = mergeDiffItems(existingItem, item, path);
    } else {
      itemsByPath[key] = item;
    }
  });

  return Model.diff(Object.values(itemsByPath));
}
