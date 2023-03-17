import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { switchSymbolId } from './symbolIds';
import { switchSymbol } from './symbols';

const placeholderText = '#off';

const globalHashtags = ['on', 'off', 'disabled'];

const parser = 'regular';

export const SwitchBlock: BlockDefinition = {
  symbol: switchSymbol,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText }) => 0.1,
  render: ({ h, Components: { [switchSymbolId]: Switch } }, props) => {
    const {
      parameters: { on, disabled },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    return h(Switch, {
      ...applyCommonProps(props),
      checked: !!on,
      disabled: !!disabled,
    });
  },
};
