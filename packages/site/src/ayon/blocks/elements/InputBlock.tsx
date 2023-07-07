import { BlockDefinition } from 'noya-state';
import { isWithinRectRange } from '../../infer/score';
import {
  getTailwindClassesByGroup,
  parametersToTailwindStyle,
} from '../../tailwind/tailwind';
import { getParameters } from '../../utils/getMappedParameters';
import { applyCommonProps } from '../applyCommonProps';
import { getBlockThemeColors } from '../blockTheme';
import { inputSymbolId } from '../symbolIds';
import { inputSymbol } from '../symbols';

const globalHashtags = [
  'dark',
  'accent',
  'disabled',
  ...getTailwindClassesByGroup('flexBasis'),
];

export const InputBlock: BlockDefinition = {
  symbol: inputSymbol,
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
    const content = props.blockText;
    const { dark, accent, disabled, ...parameters } = getParameters(
      props.blockParameters,
    );

    // const height = props.frame?.height ?? 30;
    // const size = height >= 45 ? 'lg' : height >= 30 ? 'md' : 'sm';

    const { backgroundColor, color, borderColor } = getBlockThemeColors({
      dark,
      accent,
    });

    const style = parametersToTailwindStyle(parameters);

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
        ...style,
      },
    });
  },
};
