import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { boxSymbolId } from './symbolIds';
import { spacerSymbol } from './symbols';
import { getBlockClassName, tailwindBlockClasses } from './tailwind';

export const SpacerBlock: BlockDefinition = {
  symbol: spacerSymbol,
  parser: 'regular',
  hashtags: tailwindBlockClasses,
  infer: ({ frame, blockText }) => 0,
  isPassthrough: true,
  isComposedBlock: true,
  render: ({ h, Components: { [boxSymbolId]: Box } }, props) => {
    const { parameters } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);

    return h(Box, {
      ...(props.dataSet && {
        key: props.dataSet.id,
      }),
      style: {
        backgroundColor: 'transparent',
      },
      className: getBlockClassName(hashtags),
    });
  },
};
