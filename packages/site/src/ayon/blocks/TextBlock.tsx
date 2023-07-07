import { BlockDefinition } from 'noya-state';
import {
  parametersToTailwindStyle,
  simpleAlignmentResolver,
  tailwindTextClasses,
} from '../tailwind/tailwind';
import { getParameters } from '../utils/getMappedParameters';
import { applyCommonProps } from './applyCommonProps';
import { boxSymbolId, textSymbolId } from './symbolIds';
import { textSymbol } from './symbols';

export const TextBlock: BlockDefinition = {
  symbol: textSymbol,
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
    const content = props.blockText;
    const parameters = getParameters(props.blockParameters);
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
