import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { isWithinRectRange } from './score';
import { checkboxSymbolId } from './symbolIds';
import { checkboxSymbol } from './symbols';

const placeholderText = '#off Remember me';

const globalHashtags = ['on', 'off', 'disabled'];

const parser = 'regular';

export const CheckboxBlock: BlockDefinition = {
  symbol: checkboxSymbol,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText }) =>
    isWithinRectRange({
      rect: frame,
      minWidth: 10,
      minHeight: 10,
      maxWidth: 300,
      maxHeight: 60,
    })
      ? 0.8
      : 0,
  render: ({ h, Components: { [checkboxSymbolId]: Checkbox } }, props) => {
    const {
      // content,
      parameters: { on, disabled },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    return h(
      Checkbox,
      {
        checked: !!on,
        disabled: !!disabled,
      },
      // props.frame ? props.frame.width > 40 && content : content,
    );
  },
};
