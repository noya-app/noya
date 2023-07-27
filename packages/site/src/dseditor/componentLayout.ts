import { LayoutNode } from 'noya-compiler';
import { withOptions } from 'tree-visit';
import { boxSymbolId, textSymbolId } from '../ayon/symbols/symbolIds';
import { Model } from './builders';
import { NoyaElement, NoyaNode } from './types';

export const LayoutHierarchy = withOptions<LayoutNode | string>({
  getChildren: (node) => (typeof node === 'string' ? [] : node.children),
});

const PRIMITIVE_TAG_MAP: Record<string, string> = {
  Box: boxSymbolId,
  Text: textSymbolId,
};

export function convertLayoutToComponent(layout: LayoutNode): NoyaElement {
  const result = LayoutHierarchy.map<NoyaNode>(
    layout,
    (node, transformedChildren) => {
      if (typeof node === 'string') {
        return Model.string({ value: node });
      }

      const result: NoyaNode = Model.primitiveElement({
        componentID: PRIMITIVE_TAG_MAP[node.tag],
        children: transformedChildren,
        classNames: node.attributes.class?.split(' '),
      });

      return result;
    },
  );

  if (result.type !== 'noyaPrimitiveElement') {
    throw new Error('Expected primitive element at root of layout');
  }

  return result;
}
