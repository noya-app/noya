import { memoize } from 'noya-utils';
import { Model } from './builders';
import {
  PRIMITIVE_ELEMENT_NAMES,
  PRIMITIVE_TAG_MAP,
} from './primitiveElements';
import { NoyaElement, NoyaNode } from './types';

import {
  LayoutHierarchy,
  LayoutNode,
  parseComponentLayout,
} from 'noya-compiler';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { rewriteLayout } from './rewriteLayout';

function convertLayoutToComponent(layout: LayoutNode): NoyaElement {
  const result = LayoutHierarchy.map<NoyaNode>(
    layout,
    (node, transformedChildren) => {
      if (typeof node === 'string') {
        return Model.string({ value: node });
      }

      return Model.primitiveElement({
        componentID: PRIMITIVE_TAG_MAP[node.tag],
        name: node.attributes.name || PRIMITIVE_ELEMENT_NAMES[node.tag],
        children: transformedChildren,
        classNames: node.attributes.class?.split(' '),
      });
    },
  );

  if (result.type !== 'noyaPrimitiveElement') {
    return Model.primitiveElement({ componentID: boxSymbolId });
  }

  return result;
}

export const parseLayout = memoize(function parseLayout(html: string) {
  let layout = parseComponentLayout(html);
  layout = rewriteLayout(layout);
  return convertLayoutToComponent(layout);
});
