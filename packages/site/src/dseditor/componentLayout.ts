import { memoize } from 'noya-utils';
import { parseFragment } from 'parse5';
import type {
  ChildNode,
  Element,
  TextNode,
} from 'parse5/dist/tree-adapters/default';
import { withOptions } from 'tree-visit';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { Model } from './builders';
import {
  PRIMITIVE_ELEMENT_NAMES,
  PRIMITIVE_TAG_MAP,
} from './primitiveElements';
import { NoyaElement, NoyaNode } from './types';

const HTMLHierarchy = withOptions<ChildNode>({
  getChildren: (node) => {
    if (node === undefined) {
      debugger;
    }
    return 'childNodes' in node ? node.childNodes : [];
  },
  create: (node: ChildNode, children: ChildNode[]): ChildNode =>
    'childNodes' in node ? { ...node, childNodes: children } : { ...node },
});

export function parseHTMLFragment(html: string): ChildNode | undefined {
  const result = parseFragment(html);

  let root = result.childNodes[0];

  if (!root) return;

  // Remove empty text nodes and comments
  root = HTMLHierarchy.remove(root, {
    indexPaths: HTMLHierarchy.findAllIndexPaths(root, (node, indexPath) => {
      if (indexPath.length === 0) return false;

      if (node.nodeName === '#text') {
        return (node as TextNode).value.trim() === '';
      }

      if (node.nodeName.startsWith('#')) return true;

      return false;
    }),
  });

  return root;
}

const tailwindClassMapping: Record<string, string> = {
  'text-5xl': 'variant-h1',
  'text-4xl': 'variant-h2',
  'text-3xl': 'variant-h3',
  'text-2xl': 'variant-h4',
  'text-xl': 'variant-h5',
  'text-lg': 'variant-h6',
};

export function convertLayoutToElement(
  layout: ChildNode | undefined,
): NoyaElement {
  if (!layout) {
    return Model.primitiveElement({ componentID: boxSymbolId });
  }

  const result = HTMLHierarchy.map<NoyaNode>(
    layout,
    (node, transformedChildren, indexPath) => {
      if (node.nodeName === '#text') {
        return Model.string({ value: (node as TextNode).value });
      }

      if (!('tagName' in node) || node.nodeName === '#template') {
        return Model.string({ value: 'comment' });
      }

      node = node as Element;

      const name = node.attrs.find((attr) => attr.name === 'name')?.value;
      const classes = node.attrs.find((attr) => attr.name === 'class')?.value;

      const result: NoyaNode = Model.primitiveElement({
        componentID: PRIMITIVE_TAG_MAP[node.tagName],
        name: name || PRIMITIVE_ELEMENT_NAMES[node.tagName],
        children: transformedChildren,
        classNames: classes
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
    return Model.primitiveElement({ componentID: boxSymbolId });
  }

  return result;
}

export const parseLayout = memoize(function parseLayout(html: string) {
  const layout = parseHTMLFragment(html);
  return convertLayoutToElement(layout);
});
