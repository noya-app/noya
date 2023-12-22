import { defineTree, IndexPath } from 'tree-visit';

export type Group<T> = {
  id: string;
  name: string;
  children?: Group<T>[];
};

export type FlatGroupItem<T> =
  | {
      type: 'group';
      value: Group<T>;
      indexPath: IndexPath;
    }
  | {
      type: 'item';
      value: T;
      indexPath: IndexPath;
    };

export function flattenGroups<T>({
  root,
  components,
  getGroupID,
}: {
  root: Group<T>;
  components: T[];
  getGroupID: (component: T) => string;
}): FlatGroupItem<T>[] {
  const GroupTree = defineTree<Group<T>>((group) => group?.children ?? []);

  const componentsByGroupID = components.reduce<Record<string, T[]>>(
    (acc, component) => {
      const groupID = getGroupID(component);

      return {
        ...acc,
        [groupID]: [...(acc[groupID] ?? []), component],
      };
    },
    {},
  );

  return GroupTree.flatMap(root, (group, indexPath): FlatGroupItem<T>[] => {
    const items = componentsByGroupID[group.id] ?? [];

    return [
      {
        type: 'group' as const,
        value: group,
        indexPath,
      },
      ...items.map((item) => ({
        type: 'item' as const,
        value: item,
        indexPath,
      })),
    ];
  });
}
