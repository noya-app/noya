import { BlockDefinition } from 'noya-state';
import { boxSymbolId } from '../symbols/symbolIds';
import { spacerSymbol } from '../symbols/symbols';
import {
  parametersToTailwindStyle,
  tailwindBlockClasses,
} from '../tailwind/tailwind';
import { getParameters } from '../utils/getMappedParameters';

export const SpacerBlock: BlockDefinition = {
  symbol: spacerSymbol,
  hashtags: tailwindBlockClasses,
  infer: ({ frame, blockText }) => 0,
  isPassthrough: true,
  isComposedBlock: true,
  render: ({ h, Components: { [boxSymbolId]: Box } }, props) => {
    const parameters = getParameters(props.blockParameters);
    const style = parametersToTailwindStyle(parameters);

    return h(Box, {
      ...(props.dataSet && {
        key: props.dataSet.id,
      }),
      style: {
        backgroundColor: 'transparent',
        ...style,
      },
    });
  },
};
