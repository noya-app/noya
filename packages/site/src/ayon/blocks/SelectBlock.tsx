import { BlockDefinition } from 'noya-state';
import { ParsedBlockItem } from '../parse';
import { getParameters } from '../utils/getMappedParameters';
import { applyCommonProps } from './applyCommonProps';
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

export const SelectBlock: BlockDefinition = {
  symbol: selectSymbol,
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
    const items: ParsedBlockItem[] = [
      {
        content: props.blockText ?? placeholderText,
        parameters: {},
      },
    ];
    const { dark, accent, disabled } = getParameters(props.blockParameters);
    const { backgroundColor, color, borderColor } = getBlockThemeColors({
      dark,
      accent,
    });

    return h(Select, {
      ...applyCommonProps(props),
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
