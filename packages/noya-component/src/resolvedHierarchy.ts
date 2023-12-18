import { isDeepEqual, uuid } from 'noya-utils';
import { IndexPath, defineTree } from 'tree-visit';
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

function clone<T extends NoyaResolvedNode>(node: T): T {
  return Hierarchy.map<NoyaResolvedNode>(node, (node, transformedChildren) => {
    switch (node.type) {
      case 'noyaString': {
        return {
          ...node,
          id: uuid(),
        };
      }
      case 'noyaPrimitiveElement': {
        return {
          ...node,
          id: uuid(),
          children: transformedChildren,
        };
      }
      case 'noyaCompositeElement': {
        return {
          ...node,
          id: uuid(),
          rootElement: transformedChildren[0],
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
  const indexPath = indexPathOfNode(node, target);

  if (!indexPath) return undefined;

  const nodePath = ResolvedHierarchy.accessPath(node, indexPath);

  return nodePath.map((n) => n.id);
}

export const ResolvedHierarchy = {
  ...Hierarchy,
  clone,
  findByPath,
  findTypeByPath,
  indexPathOfNode,
  keyPathOfNode,
};
