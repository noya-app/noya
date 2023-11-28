import { NoyaResolvedNode } from 'noya-component';
import { uuid } from 'noya-utils';
import { defineTree } from 'tree-visit';

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
});

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

export const ResolvedHierarchy = { ...Hierarchy, clone };
