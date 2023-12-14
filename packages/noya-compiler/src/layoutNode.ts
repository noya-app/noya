import { defineTree } from 'tree-visit';
import { LayoutNode, LayoutNodeAttributes } from './parseComponentLayout';

export function layoutNode(
  tag: string,
  attributes: LayoutNodeAttributes = {},
  children: (LayoutNode | string)[] = [],
): LayoutNode {
  return { tag, attributes, children };
}

export const LayoutHierarchy = defineTree<LayoutNode | string>({
  getChildren: (node) => (typeof node === 'string' ? [] : node.children),
}).withOptions({
  create: (node: LayoutNode | string, children: (LayoutNode | string)[]) => {
    return typeof node === 'string' ? node : { ...node, children };
  },
});
