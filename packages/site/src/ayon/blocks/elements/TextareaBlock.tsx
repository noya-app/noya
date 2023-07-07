import { BlockDefinition } from 'noya-state';
import { getParameters } from '../../utils/getMappedParameters';
import { applyCommonProps } from '../applyCommonProps';
import { getBlockThemeColors } from '../blockTheme';
import { textareaSymbolId } from '../symbolIds';
import { textareaSymbol } from '../symbols';

const globalHashtags = ['dark', 'accent', 'disabled'];

export const TextareaBlock: BlockDefinition = {
  symbol: textareaSymbol,
  hashtags: globalHashtags,
  infer: ({ frame, blockText }) => 0.1,
  render: ({ h, Components: { [textareaSymbolId]: Textarea } }, props) => {
    const content = props.blockText;
    const { dark, accent, disabled } = getParameters(props.blockParameters);

    const { backgroundColor, color, borderColor } = getBlockThemeColors({
      dark,
      accent,
    });

    return h(Textarea, {
      ...applyCommonProps(props),
      value: content,
      disabled: !!disabled,
      style: {
        backgroundColor,
        color,
        borderColor,
        ...(props.frame && {
          width: `${props.frame.width}px`,
          height: `${props.frame.height}px`,
        }),
      },
    });
  },
};
