import { memoize } from '@noya-app/noya-utils';
import { NoyaAPI } from 'noya-api';
import {
  LayoutHierarchy,
  LayoutNode,
  parseComponentLayout,
} from 'noya-compiler';
import {
  Model,
  NoyaNode,
  NoyaResolvedNode,
  PRIMITIVE_ELEMENT_MAP,
  PRIMITIVE_TAG_MAP,
  ResolvedHierarchy,
  createSeed,
} from 'noya-component';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
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
      .split(/\s+|-|_/)
      .filter((word) => !IMAGE_ALT_REWRITE_MAP.has(word.toLowerCase()))
      .join(' ') || 'landscape'
  );
}

function convertLayoutToComponent(
  layout: LayoutNode,
  imageGenerator: NoyaAPI.ImageGenerator,
): NoyaNode {
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

      if (elementName === 'Card') {
        // Assign a random variant. Elevated should be most common
        const variantOptions = ['elevated', 'elevated', 'outline', 'solid'];
        const rootClassCount = layout.attributes.class?.split(' ').length ?? 0;
        const offset = indexPath.length + rootClassCount;
        const variant = variantOptions[offset % variantOptions.length];

        if (variant !== 'elevated') {
          classes.push(`variant-${variant}`);
        }
      }

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
                  : imageGenerator === 'random-image'
                  ? Model.generatorProp({
                      name: 'src',
                      generator: 'random-image',
                      query: rewriteImageAlt(
                        node.attributes.alt ?? 'landscape',
                      ),
                    })
                  : Model.generatorProp({
                      name: 'src',
                      generator: 'geometric',
                      query: createSeed(indexPath.join('/')),
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

export const parseLayout = memoize(function parseLayout(
  html: string,
  imageGenerator: NoyaAPI.ImageGenerator,
) {
  return parseLayoutWithOptions(html, imageGenerator, { rewrite: true });
});

export function parseLayoutWithOptions(
  html: string,
  imageGenerator: NoyaAPI.ImageGenerator,
  { rewrite }: { rewrite: boolean },
) {
  let layout = parseComponentLayout(html);

  if (rewrite) {
    layout = rewriteLayout(layout);
  }

  return enforceSchema(convertLayoutToComponent(layout, imageGenerator));
}

export function exportLayout(layout: NoyaResolvedNode): string {
  const layoutNode = noyaNodeToLayoutNode(layout);
  return stringifyLayoutNode(layoutNode);
}

function noyaNodeToLayoutNode(layout: NoyaResolvedNode): string | LayoutNode {
  return ResolvedHierarchy.map<LayoutNode | string>(
    layout,
    (node, children): LayoutNode | string => {
      switch (node.type) {
        case 'noyaString':
          return node.value;
        case 'noyaPrimitiveElement':
          return {
            tag: PRIMITIVE_ELEMENT_MAP[node.componentID].name,
            attributes: {
              ...(node.name && { name: node.name }),
              ...Object.fromEntries(
                node.props
                  .map((prop) => [
                    prop.name,
                    prop.type === 'string' ? prop.value : '',
                  ])
                  .filter(([_, value]) => value),
              ),
              ...(node.classNames.length > 0 && {
                class: node.classNames
                  .map((className) => className.value)
                  .join(' '),
              }),
            },
            children,
          };
        case 'noyaCompositeElement':
          return noyaNodeToLayoutNode(node.rootElement);
      }
    },
  );
}

function stringifyLayoutNode(root: string | LayoutNode): string {
  let out = '';
  let indent = 0;

  LayoutHierarchy.visit(root, {
    onEnter: (node: LayoutNode | string) => {
      if (out !== '') {
        out += `\n${'  '.repeat(indent)}`;
      }

      indent += 1;

      if (typeof node === 'string') {
        out += node;
        return;
      }

      const attributes = Object.entries(node.attributes)
        .map(([key, value]) => {
          if (value) {
            return `${key}="${value}"`;
          }
          return key;
        })
        .join(' ');

      out += `<${[node.tag, attributes].filter(Boolean).join(' ')}>`;
    },
    onLeave: (node: LayoutNode | string) => {
      indent -= 1;

      if (typeof node === 'string') {
        return;
      }

      out += `\n${'  '.repeat(indent)}`;
      out += `</${node.tag}>`;
    },
  });

  return out;
}
