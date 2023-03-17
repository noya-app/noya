import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { getBlockThemeColors } from './colors';
import { textareaSymbolId } from './symbolIds';
import { textareaSymbol } from './symbols';

const globalHashtags = ['dark', 'accent', 'disabled'];

const parser = 'regular';

export const TextareaBlock: BlockDefinition = {
  symbol: textareaSymbol,
  parser,
  hashtags: globalHashtags,
  infer: ({ frame, blockText }) => 0.1,
  render: ({ h, Components: { [textareaSymbolId]: Textarea } }, props) => {
    const {
      content,
      parameters: { dark, accent, disabled },
    } = parseBlock(props.blockText, parser);

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
