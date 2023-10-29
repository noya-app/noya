import { uuid } from 'noya-utils';
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
});

function clone(node: NoyaResolvedNode): NoyaResolvedNode {
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
  });
}

export const ResolvedHierarchy = { ...Hierarchy, clone };
