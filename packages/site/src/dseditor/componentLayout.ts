import { memoize } from 'noya-utils';
import { Model } from './builders';
import { PRIMITIVE_TAG_MAP } from './primitiveElements';
import { NoyaNode } from './types';

import {
  LayoutHierarchy,
  LayoutNode,
  parseComponentLayout,
} from 'noya-compiler';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { createSeed } from '../ayon/utils/patterns';
import { enforceSchema } from './layoutSchema';
import { rewriteLayout } from './rewriteLayout';

const IMAGE_ALT_REWRITE_MAP = new Set([
  'related',
  'image',
  'images',
  'video',
  'videos',
  'photo',
  'photos',
  'picture',
  'pictures',
  'icon',
  'icons',
  'or',
  'of',
  'and',
  'for',
  'supporting',
  'visual',
  'like',
  'element',
  'etc.',
  'etc',
  'primary',
  'secondary',
  'description',
  'first',
  'second',
  'third',
  '1',
  '2',
  '3',
  '1st',
  '2nd',
  '3rd',
  'a',
  'an',
  'the',
  'high-res',
  'high-resolution',
  'relevant',
]);

function rewriteImageAlt(string: string) {
  return (
    (string || '')
      .toLowerCase()
      .split(' ')
      .filter((word) => !IMAGE_ALT_REWRITE_MAP.has(word.toLowerCase()))
      .join(' ') || 'landscape'
  );
}

function convertLayoutToComponent(layout: LayoutNode): NoyaNode {
  const result = LayoutHierarchy.map<NoyaNode>(
    layout,
    (node, transformedChildren, indexPath) => {
      if (typeof node === 'string') {
        return Model.string({ value: node });
      }

      const initialTag = node.tag.toLowerCase();
      const tag = initialTag === 'icon' ? 'image' : initialTag;
      const primitive = PRIMITIVE_TAG_MAP[tag] ?? PRIMITIVE_TAG_MAP['box'];
      const elementName = primitive.name;
      const classes = node.attributes.class?.split(' ') ?? [];
      const name = node.attributes.name || primitive.name;

      return Model.primitiveElement({
        componentID: primitive.id,
        name,
        children: transformedChildren,
        classNames: classes.map((value) => Model.className(value)),
        props: [
          ...(elementName === 'Image'
            ? [
                initialTag === 'icon'
                  ? Model.generatorProp({
                      name: 'src',
                      generator: 'random-icon',
                      query: rewriteImageAlt(
                        node.attributes.alt ?? 'landscape',
                      ),
                    })
                  : Model.generatorProp({
                      name: 'src',
                      generator: 'geometric',
                      query: createSeed(
                        [...indexPath, ...classes, name].join('/'),
                      ),
                    }),
              ]
            : []),
          ...(elementName === 'Input' && node.attributes.placeholder
            ? [
                Model.stringProp({
                  name: 'placeholder',
                  value: node.attributes.placeholder,
                }),
              ]
            : []),
        ],
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
  return enforceSchema(convertLayoutToComponent(layout));
});
