import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { getBlockThemeColors } from './colors';
import { isWithinRectRange } from './score';
import { selectSymbolId } from './symbolIds';
import { selectSymbol } from './symbols';

const placeholderText = `
Role
Guest
Member
Admin`.trim();

const globalHashtags = ['dark', 'accent', 'disabled'];

const parser = 'newlineSeparated';

export const SelectBlock: BlockDefinition = {
  symbol: selectSymbol,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText }) =>
    isWithinRectRange({
      rect: frame,
      minWidth: 60,
      minHeight: 25,
      maxWidth: 400,
      maxHeight: 80,
    })
      ? 0.7
      : 0,
  render: ({ h, Components: { [selectSymbolId]: Select } }, props) => {
    const {
      items,
      parameters: { dark, accent, disabled },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const { backgroundColor, color, borderColor } = getBlockThemeColors({
      dark,
      accent,
    });

    return h(Select, {
      ...(props.dataSet && {
        key: props.dataSet.id,
        'data-noya-id': props.dataSet.id,
        'data-noya-parent-id': props.dataSet.parentId,
      }),
      style: {
        backgroundColor,
        color,
        borderColor,
      },
      disabled: !!disabled,
      value: items[0].content,
      options: items.map((item) => item.content),
    });
  },
};
