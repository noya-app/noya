import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
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
      ...(props.dataSet && {
        key: props.dataSet.id,
        'data-noya-id': props.dataSet.id,
        'data-noya-parent-id': props.dataSet.parentId,
      }),
      checked: !!on,
      disabled: !!disabled,
    });
  },
};
