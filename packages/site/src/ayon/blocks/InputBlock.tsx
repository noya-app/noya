import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { getBlockThemeColors } from './colors';
import { isWithinRectRange } from './score';
import { inputSymbolId } from './symbolIds';
import { inputSymbol } from './symbols';
import { getBlockClassName, getTailwindClassesByGroup } from './tailwind';

const globalHashtags = [
  'dark',
  'accent',
  'disabled',
  ...getTailwindClassesByGroup('flexBasis'),
];

const parser = 'regular';

export const InputBlock: BlockDefinition = {
  symbol: inputSymbol,
  parser,
  hashtags: globalHashtags,
  infer: ({ frame, blockText }) =>
    isWithinRectRange({
      rect: frame,
      minWidth: 60,
      minHeight: 25,
      maxWidth: 600,
      maxHeight: 80,
    })
      ? 0.75
      : 0,
  render: ({ h, Components: { [inputSymbolId]: Input } }, props) => {
    const {
      content,
      parameters: { dark, accent, disabled, ...parameters },
    } = parseBlock(props.blockText, parser);

    const hashtags = Object.keys(parameters);

    // const height = props.frame?.height ?? 30;
    // const size = height >= 45 ? 'lg' : height >= 30 ? 'md' : 'sm';

    const { backgroundColor, color, borderColor } = getBlockThemeColors({
      dark,
      accent,
    });

    return h(Input, {
      ...applyCommonProps(props),
      placeholder: content,
      disabled: !!disabled,
      style: {
        backgroundColor,
        color,
        borderColor,
        ...(props.frame && {
          width: `${props.frame.width}px`,
        }),
      },
      className: getBlockClassName(hashtags),
    });
  },
};
