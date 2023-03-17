import { BlockDefinition } from 'noya-state';
import { getTextAlign, parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { textSymbolId } from './symbolIds';
import { textSymbol } from './symbols';
import { getBlockClassName, tailwindTextClasses } from './tailwind';

export const TextBlock: BlockDefinition = {
  symbol: textSymbol,
  parser: 'regular',
  hashtags: ['left', 'center', 'right', ...tailwindTextClasses, 'flex-1'],
  infer: ({ frame, blockText }) =>
    Math.max(
      blockText &&
        blockText.split(' ').filter((word) => word[0] !== '#').length > 0
        ? 0.7
        : 0,
      0.1,
    ),
  render: ({ h, Components: { [textSymbolId]: Text } }, props) => {
    const { content, parameters } = parseBlock(props.blockText, 'regular');

    const hashtags = Object.keys(parameters);

    return h(
      Text,
      {
        ...applyCommonProps(props),
        style: {
          textAlign: getTextAlign(hashtags),
        },
        className: getBlockClassName(hashtags),
      },
      content,
    );
  },
};
