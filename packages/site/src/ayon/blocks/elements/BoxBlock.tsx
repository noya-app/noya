import { BlockDefinition } from 'noya-state';
import { findLast } from 'noya-utils';
import {
  parametersToTailwindStyle,
  tailwindBlockClasses,
} from '../../tailwind/tailwind';
import { getParameters } from '../../utils/getMappedParameters';
import { applyCommonProps } from '../applyCommonProps';
import { getBlockThemeColors } from '../blockTheme';
import { boxSymbolId } from '../symbolIds';
import { boxSymbol } from '../symbols';

export const BoxBlock: BlockDefinition = {
  symbol: boxSymbol,
  infer: ({ frame, blockText }) => 0.1,
  hashtags: ['left', 'center', 'right', 'dark', ...tailwindBlockClasses],
  render: ({ h, Components: { [boxSymbolId]: Box } }, props) => {
    const parameters = getParameters(props.blockParameters);
    const hashtags = Object.keys(parameters);

    const themeStyle = parameters.dark
      ? {
          backgroundColor: getBlockThemeColors({ dark: true, accent: false })
            .backgroundColor,
        }
      : {};

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
          ...themeStyle,
          ...style,
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
