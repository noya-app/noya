import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { isWithinRectRange } from './score';
import { radioSymbolId } from './symbolIds';
import { radioSymbol } from './symbols';

const placeholderText = '#off Daily';

const globalHashtags = ['on', 'off', 'disabled'];

const parser = 'regular';

export const RadioBlock: BlockDefinition = {
  symbol: radioSymbol,
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
  render: ({ h, Components: { [radioSymbolId]: Radio } }, props) => {
    const {
      // content,
      parameters: { on, disabled },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    // const width = props.frame ? props.frame.width : 40;

    return h(
      Radio,
      {
        checked: !!on,
        disabled: !!disabled,
      },
      // width >= 40 && content,
    );
  },
};
