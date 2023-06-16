import { BlockDefinition } from 'noya-state';
import { findLast } from 'noya-utils';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { accentColor } from './blockTheme';
import { getBlockThemeColors } from './colors';
import { boxSymbolId } from './symbolIds';
import { boxSymbol } from './symbols';
import {
  getLastClassInGroup,
  parametersToTailwindStyle,
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

    const { justify, items } = simpleFlex(hashtags);

    const style = parametersToTailwindStyle({
      ...parameters,
      ...(justify && { [justify]: true }),
      ...(items && { [items]: true }),
    });

    return h(
      Box,
      {
        ...applyCommonProps(props),
        style: {
          display: 'flex',
          ...style,
          backgroundColor,
          ...(props.frame && {
            width: `${props.frame.width}px`,
            height: `${props.frame.height}px`,
          }),
        },
      },
      props.children,
    );
  },
};

// Simplify flexbox alignment by handling row vs. column automatically
function simpleFlex(hashtags: string[]) {
  const flexKey = findLast(hashtags, (value) =>
    /^(flex-row|flex-col)$/.test(value),
  );
  const alignmentKey = findLast(hashtags, (value) =>
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

  return { justify, items };
}
