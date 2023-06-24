import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { boxSymbolId, textSymbolId } from './symbolIds';
import { textSymbol } from './symbols';
import {
  parametersToTailwindStyle,
  simpleAlignmentResolver,
  tailwindTextClasses,
} from './tailwind';

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
  render: (
    { h, Components: { [textSymbolId]: Text, [boxSymbolId]: Box } },
    props,
  ) => {
    const { content, parameters } = parseBlock(props.blockText, 'regular');
    const style = parametersToTailwindStyle(
      parameters,
      simpleAlignmentResolver,
    );

    return h(
      Text,
      {
        ...applyCommonProps(props),
        style,
      },
      content,
    );
  },
};
