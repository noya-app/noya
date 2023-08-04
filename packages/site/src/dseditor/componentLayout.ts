import { LayoutNode } from 'noya-compiler';
import { withOptions } from 'tree-visit';
import { Model } from './builders';
import { PRIMITIVE_TAG_MAP } from './primitiveElements';
import { NoyaElement, NoyaNode } from './types';

export const LayoutHierarchy = withOptions<LayoutNode | string>({
  getChildren: (node) => (typeof node === 'string' ? [] : node.children),
});

const tailwindClassMapping: Record<string, string> = {
  'text-5xl': 'variant-h1',
  'text-4xl': 'variant-h2',
  'text-3xl': 'variant-h3',
  'text-2xl': 'variant-h4',
  'text-xl': 'variant-h5',
  'text-lg': 'variant-h6',
};

export function convertLayoutToComponent(layout: LayoutNode): NoyaElement {
  const result = LayoutHierarchy.map<NoyaNode>(
    layout,
    (node, transformedChildren, indexPath) => {
      if (typeof node === 'string') {
        return Model.string({ value: node });
      }

      const result: NoyaNode = Model.primitiveElement({
        componentID: PRIMITIVE_TAG_MAP[node.tag],
        children: transformedChildren,
        classNames: node.attributes.class
          ?.split(' ')
          .map((className) => tailwindClassMapping[className] || className),
      });

      if (indexPath.length === 0 && !result.classNames.includes('flex-1')) {
        result.classNames?.push('flex-1');
      }

      return result;
    },
  );

  if (result.type !== 'noyaPrimitiveElement') {
    throw new Error('Expected primitive element at root of layout');
  }

  return result;
}
