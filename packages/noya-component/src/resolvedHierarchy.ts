import { isDeepEqual, uuid } from 'noya-utils';
import { defineTree } from 'tree-visit';
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
        return [node.name || node.componentID, '<comp>', pathString].join(' ');
      case 'noyaPrimitiveElement':
        const classNames = node.classNames.map((c) => c.value).join(' ');

        return [
          [node.name || node.componentID, '<prim>', pathString].join(' '),
          classNames,
        ]
          .filter(Boolean)
          .map((v, i) => (i > 0 ? '  ' + v : v))
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

export const ResolvedHierarchy = {
  ...Hierarchy,
  clone,
  findByPath,
  findTypeByPath,
};
