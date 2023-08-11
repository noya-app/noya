import { memoize } from 'noya-utils';
import { withOptions } from 'tree-visit';
import { Model } from './builders';
import {
  PRIMITIVE_ELEMENT_NAMES,
  PRIMITIVE_TAG_MAP,
} from './primitiveElements';
import { NoyaElement, NoyaNode } from './types';

import { LayoutNode, parseComponentLayout } from 'noya-compiler';
import { boxSymbolId } from '../ayon/symbols/symbolIds';

const LayoutHierarchy = withOptions<LayoutNode | string>({
  getChildren: (node) => (typeof node === 'string' ? [] : node.children),
});

const tailwindClassMapping: Record<string, string> = {
  'text-5xl': 'variant-h1',
  'text-4xl': 'variant-h2',
  'text-3xl': 'variant-h3',
  'text-2xl': 'variant-h4',
  'text-xl': 'variant-h5',
  'text-lg': 'variant-h6',
  grow: 'flex-1',
};

function convertLayoutToComponent(layout: LayoutNode): NoyaElement {
  const result = LayoutHierarchy.map<NoyaNode>(
    layout,
    (node, transformedChildren, indexPath) => {
      if (typeof node === 'string') {
        return Model.string({ value: node });
      }

      const result: NoyaNode = Model.primitiveElement({
        componentID: PRIMITIVE_TAG_MAP[node.tag],
        name: node.attributes.name || PRIMITIVE_ELEMENT_NAMES[node.tag],
        children: transformedChildren,
        classNames: node.attributes.class
          ?.split(' ')
          .map((className) => tailwindClassMapping[className] || className),
      });

      // Adjust the root
      if (indexPath.length === 0) {
        if (!result.classNames.includes('flex-1')) {
          result.classNames.push('flex-1');
        }
        if (!result.classNames.includes('relative')) {
          result.classNames.push('relative');
        }
      }

      return result;
    },
  );

  if (result.type !== 'noyaPrimitiveElement') {
    return Model.primitiveElement({ componentID: boxSymbolId });
  }

  return result;
}

export const parseLayout = memoize(function parseLayout(html: string) {
  const layout = parseComponentLayout(html);
  return convertLayoutToComponent(layout);
});
