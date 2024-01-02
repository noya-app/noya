import { delimitedPath } from '@noya-app/noya-utils';
import { accessPath, IndexPath, visit } from 'tree-visit';

type ThemeTreeNode<T> = {
  name: string;
  items: T[];
  children: ThemeTreeNode<T>[];
};

type BaseThemeItem = { name: string };

function createItemGroup<T extends BaseThemeItem>(
  name: string,
): ThemeTreeNode<T> {
  return {
    name,
    items: [],
    children: [],
  };
}

function createThemeTree<T extends BaseThemeItem>(
  items: T[],
): ThemeTreeNode<T> {
  const root = createItemGroup<T>('');

  function getGroup(pathComponents: string[]): ThemeTreeNode<T> {
    let group = root;

    while (pathComponents.length > 0) {
      const component = pathComponents.shift()!;
      const existing = group.children.find((group) => group.name === component);

      if (existing) {
        group = existing;
      } else {
        const newGroup = createItemGroup<T>(component);

        group.children.push(newGroup);
        group = newGroup;
      }
    }

    return group;
  }

  items.forEach((item) => {
    const pathComponents = item.name.split('/');
    const parent = getGroup(pathComponents.slice(0, -1));
    parent.items.push(item);
  });

  return root;
}

function visitThemeTree<T extends BaseThemeItem>(
  root: ThemeTreeNode<T>,
  f: (group: ThemeTreeNode<T>, indexPath: IndexPath, path: string) => void,
): void {
  const getChildren = (group: ThemeTreeNode<T>) => group.children;

  visit(root, {
    onEnter: (group, indexPath) => {
      const pathComponents = accessPath(root, indexPath, { getChildren }).map(
        (item) => item.name,
      );
      f(group, indexPath, delimitedPath.join(pathComponents));
    },
    getChildren,
  });
}

export type ThemeGroup<T extends BaseThemeItem> = {
  name: string;
  path: string;
  items: T[];
  depth: number;
};

function flattenThemeTree<T extends BaseThemeItem>(
  root: ThemeTreeNode<T>,
): ThemeGroup<T>[] {
  const items: ThemeGroup<T>[] = [];

  visitThemeTree<T>(root, (group, indexPath, path) => {
    items.push({
      name: group.name,
      items: group.items,
      path,
      depth: Math.max(indexPath.length - 1, 0),
    });
  });

  return items;
}

export function createThemeGroups<T extends BaseThemeItem>(
  items: T[],
): ThemeGroup<T>[] {
  return flattenThemeTree(createThemeTree(items));
}
