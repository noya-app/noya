import { component } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { CSSProperties } from 'react';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { linkSymbolId } from './symbolIds';
import { linkSymbol } from './symbols';
import {
  getBlockClassName,
  getLastClassInGroup,
  tailwindTextClasses,
} from './tailwind';
import { resolveColor } from './tailwindColors';

const placeholderText = 'Read More';

const parser = 'regular';

export const LinkBlock: BlockDefinition = {
  symbol: linkSymbol,
  parser,
  hashtags: [
    'icon-arrow-forward',
    'left',
    'center',
    'right',
    ...tailwindTextClasses,
    'flex-1',
  ],
  placeholderText,
  infer: ({ frame, blockText }) => 0,
  render: (
    {
      h,
      Components: {
        [linkSymbolId]: Link,
        [component.id.IconArrowForward]: IconArrowForward,
      },
    },
    props,
  ) => {
    const { content, parameters } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const hashtags = Object.keys(parameters);
    const colorKey = getLastClassInGroup('textColor', hashtags);
    const color = colorKey ? resolveColor(colorKey) : 'dodgerblue';
    const textDecoration = getLastClassInGroup('textDecoration', hashtags);
    const textDecorationValue =
      textDecoration === 'no-underline'
        ? 'none'
        : textDecoration === 'line-through'
        ? 'line-through'
        : textDecoration === 'overline'
        ? 'overline'
        : undefined;

    return h(
      Link,
      {
        ...applyCommonProps(props),
        style: {
          fontWeight: 500,
          color,
          textDecorationColor: color,
          ...(textDecorationValue && {
            textDecorationLine: textDecorationValue,
          }),
        } as CSSProperties,
        className: getBlockClassName(hashtags),
      },
      [
        content,
        ...(parameters['icon-arrow-forward']
          ? [
              ' ',
              h(IconArrowForward, {
                style: {
                  verticalAlign: 'text-bottom',
                  width: '16px',
                  height: '16px',
                  textDecorationColor: color,
                  ...(textDecorationValue && {
                    textDecorationLine: textDecorationValue,
                  }),
                },
              }),
            ]
          : []),
      ],
    );
  },
};
