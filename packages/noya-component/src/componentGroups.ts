import { defineTree } from 'tree-visit';
import { FlatGroupItem, Group, flattenGroups } from './groups';
import { NoyaComponent } from './types';

export type ComponentGroup = Group<NoyaComponent>;

export const UNCATEGORIZED = 'uncategorized';

export const ComponentGroupTree = defineTree<ComponentGroup>(
  (group) => group?.children ?? [],
).withOptions({
  create: (node, children) => ({ ...node, children }),
});

export function flattenComponentGroups({
  groups,
  components,
}: {
  groups?: ComponentGroup[];
  components: NoyaComponent[];
}): (FlatGroupItem<NoyaComponent> & { depth: number })[] {
  const root = createRootGroup(groups);

  const allGroupIDs = new Set(
    ComponentGroupTree.flatMap(root, (group) => [group.id]),
  );

  return flattenGroups({
    root,
    components,
    getGroupID: ({ groupID }) =>
      groupID && allGroupIDs.has(groupID) ? groupID : UNCATEGORIZED,
  })
    .filter((item) => item.value.id !== 'root')
    .map((item) => ({ ...item, depth: item.indexPath.length - 1 }));
}

export function createRootGroup(groups?: ComponentGroup[]): ComponentGroup {
  return {
    id: 'root',
    name: 'Root',
    children: [
      ...(groups ?? []).filter((group) => group.id !== UNCATEGORIZED),
      { id: UNCATEGORIZED, name: UNCATEGORIZED, children: [] },
    ],
  };
}

export function getSavableComponentGroups(
  root: ComponentGroup,
): ComponentGroup[] | undefined {
  const uncategorizedIndexPaths = ComponentGroupTree.findAllIndexPaths(
    root,
    (group) => group.id === UNCATEGORIZED,
  );

  const newRoot =
    uncategorizedIndexPaths.length > 0
      ? ComponentGroupTree.remove(root, {
          indexPaths: uncategorizedIndexPaths,
        })
      : root;

  return newRoot.children;
}
