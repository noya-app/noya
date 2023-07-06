import { BlockDefinition } from 'noya-state';
import { getTextAlign } from '../parse';
import { getParameters } from '../utils/getMappedParameters';
import { boxSymbolId, textSymbolId } from './symbolIds';
import { writeSymbol } from './symbols';
import { getBlockClassName, tailwindTextClasses } from './tailwind';

export const WriteBlock: BlockDefinition = {
  symbol: writeSymbol,
  hashtags: ['left', 'right', 'center', ...tailwindTextClasses],
  usesResolver: true,
  isComposedBlock: true,
  infer: ({ frame, blockText }) => 0.1,
  render: (
    { h, Components: { [textSymbolId]: Text, [boxSymbolId]: Box } },
    props,
  ) => {
    const content = props.blockText;
    const parameters = getParameters(props.blockParameters);
    const hashtags = Object.keys(parameters);

    return h(
      Text,
      {
        style: {
          textAlign: getTextAlign(hashtags),
        },
        className: getBlockClassName(hashtags),
      },
      [
        props.resolvedBlockData?.resolvedText ??
          h(Box, {}, [
            h(
              'span',
              {},
              props.blockText
                ? `Writing about ${content}...`
                : 'Waiting for input...',
            ),
          ]),
      ],
    );
  },
};
