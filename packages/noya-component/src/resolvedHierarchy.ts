import { isDeepEqual, uuid } from '@noya-app/noya-utils';
import { IndexPath, defineTree } from 'tree-visit';
import { mapArrayDiff } from './arrayDiff';
import { NoyaResolvedNode } from './types';

const Hierarchy = defineTree<NoyaResolvedNode>({
  getChildren: (node) => {
    switch (node.type) {
      case 'noyaString':
        return [];
      case 'noyaCompositeElement':
        return [node.rootElement];
      case 'noyaPrimitiveElement':
        return node.children;
    }
  },
}).withOptions({
  create: (node: NoyaResolvedNode, children: NoyaResolvedNode[]) => {
    switch (node.type) {
      case 'noyaString':
        return node;
      case 'noyaCompositeElement':
        return { ...node, rootElement: children[0] };
      case 'noyaPrimitiveElement':
        return { ...node, children };
    }
  },
  getLabel: (node) => {
    const pathString = `[${node.path
      .map((p) => ellipsisMiddle(p, 8))
      .join('/')}]`;

    switch (node.type) {
      case 'noyaString':
        return [JSON.stringify(node.value), pathString].join(' ');
      case 'noyaCompositeElement':
        return [
          [
            node.name ? node.name : '',
            `comp:${node.componentID}`,
            `id:${ellipsisMiddle(node.id, 8)}`,
            pathString,
          ]
            .filter(Boolean)
            .join(' '),
          node.diff && node.diff?.items.length > 0
            ? `diff:${node.diff.items.map((item) => JSON.stringify(item))}`
            : '',
        ]
          .filter(Boolean)
          .join('\n');
      case 'noyaPrimitiveElement':
        const classNames = node.classNames.map((c) => c.value).join(' ');

        return [
          [
            node.name ? node.name : '',
            `prim:${node.componentID}`,
            `id:${ellipsisMiddle(node.id, 8)}`,
            pathString,
          ]
            .filter(Boolean)
            .join(' '),
          classNames.length > 0 ? `class:${classNames}` : '',
        ]
          .filter(Boolean)
          .join('\n');
    }
  },
});

function ellipsisMiddle(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;

  const start = str.slice(0, maxLength / 2);
  const end = str.slice(-maxLength / 2);

  return `${start}...${end}`;
}

function clone<T extends NoyaResolvedNode>(
  node: T,
  { uuid: _uuid = uuid }: { uuid?: () => string } = {},
): T {
  const idMapping = new Map<string, string>();

  const createConsistentId = (id: string) => {
    if (idMapping.has(id)) return idMapping.get(id)!;

    const newId = _uuid();

    idMapping.set(id, newId);

    return newId;
  };

  return Hierarchy.map<NoyaResolvedNode>(node, (node, transformedChildren) => {
    switch (node.type) {
      case 'noyaString': {
        return {
          ...node,
          id: createConsistentId(node.id),
        };
      }
      case 'noyaPrimitiveElement': {
        return {
          ...node,
          id: createConsistentId(node.id),
          children: transformedChildren,
        };
      }
      case 'noyaCompositeElement': {
        return {
          ...node,
          id: createConsistentId(node.id),
          rootElement: transformedChildren[0],
          ...(node.diff && {
            diff: {
              items: node.diff.items.map((item) => {
                return {
                  ...item,
                  path: item.path.map(createConsistentId),
                  ...(item.children && {
                    children: mapArrayDiff(item.children, (child) => {
                      return { ...child, id: createConsistentId(child.id) };
                    }),
                  }),
                };
              }),
            },
          }),
        };
      }
    }
  }) as T;
}

function findByPath(
  node: NoyaResolvedNode,
  path: string[] | undefined,
): NoyaResolvedNode | undefined {
  return ResolvedHierarchy.find(node, (n) => isDeepEqual(n.path, path));
}

function findTypeByPath<T extends NoyaResolvedNode['type']>(
  node: NoyaResolvedNode,
  path: string[] | undefined,
  type: T,
) {
  return ResolvedHierarchy.find(
    node,
    (n) => n.type === type && isDeepEqual(n.path, path),
  ) as Extract<NoyaResolvedNode, { type: T }> | undefined;
}

function indexPathOfNode(
  node: NoyaResolvedNode,
  target: NoyaResolvedNode,
): IndexPath | undefined {
  return ResolvedHierarchy.findIndexPath(node, (n) => n === target);
}

function keyPathOfNode(
  node: NoyaResolvedNode,
  target: NoyaResolvedNode,
): string[] | undefined {
  return findKeyPath(node, (n) => n === target);
}

function findKeyPath(
  node: NoyaResolvedNode,
  predicate: (node: NoyaResolvedNode) => boolean,
): string[] | undefined {
  const indexPath = ResolvedHierarchy.findIndexPath(node, predicate);

  if (!indexPath) return undefined;

  const nodePath = ResolvedHierarchy.accessPath(node, indexPath);

  return nodePath.map((n) => n.id);
}

export const ResolvedHierarchy = {
  ...Hierarchy,
  clone,
  findKeyPath,
  findByPath,
  findTypeByPath,
  indexPathOfNode,
  keyPathOfNode,
};
