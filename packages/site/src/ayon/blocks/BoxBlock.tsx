import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { accentColor } from './blockTheme';
import { getBlockThemeColors } from './colors';
import { boxSymbolId } from './symbolIds';
import { boxSymbol } from './symbols';
import {
  getBlockClassName,
  getLastClassInGroup,
  tailwindBlockClasses,
} from './tailwind';

export const BoxBlock: BlockDefinition = {
  symbol: boxSymbol,
  parser: 'regular',
  infer: ({ frame, blockText }) => 0.1,
  hashtags: ['left', 'center', 'right', 'dark', ...tailwindBlockClasses],
  render: ({ h, Components: { [boxSymbolId]: Box } }, props) => {
    const { content, parameters } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);

    const bgClass = getLastClassInGroup('background', hashtags);
    const dynamicClass = bgClass
      ? typeof parameters[bgClass] === 'string'
      : undefined;

    const backgroundColor = parameters.dark
      ? getBlockThemeColors({ dark: true, accent: false }).backgroundColor
      : bgClass
      ? dynamicClass
        ? parameters[bgClass]
        : undefined
      : [content]
          .concat(hashtags)
          .find((value) => CSS.supports('color', `${value}`)) ??
        accentColor[50];

    const hashtagsReversed = hashtags.slice().reverse();
    const flexKey = hashtagsReversed.find((value) =>
      /^(flex-row|flex-col)$/.test(value),
    );
    const alignmentKey = hashtagsReversed.find((value) =>
      /^(left|center|right)$/.test(value),
    );

    let justify: string | undefined;
    let items: string | undefined;

    if (flexKey === 'flex-row') {
      switch (alignmentKey) {
        case 'left':
          justify = 'justify-start';
          break;
        case 'center':
          justify = 'justify-center';
          break;
        case 'right':
          justify = 'justify-end';
          break;
      }

      if (hashtags.includes('center')) {
        items = 'items-center';
      }
    } else if (flexKey === 'flex-col') {
      switch (alignmentKey) {
        case 'left':
          items = 'items-start';
          break;
        case 'center':
          items = 'items-center';
          break;
        case 'right':
          items = 'items-end';
          break;
      }

      if (hashtags.includes('center')) {
        justify = 'justify-center';
      }
    }

    return h(
      Box,
      {
        ...applyCommonProps(props),
        style: {
          display: 'flex',
          backgroundColor,
          ...(props.frame && {
            width: `${props.frame.width}px`,
            height: `${props.frame.height}px`,
          }),
        },
        className: getBlockClassName([
          ...hashtags,
          ...(items ? [items] : []),
          ...(justify ? [justify] : []),
        ]),
      },
      props.children,
    );
  },
};
