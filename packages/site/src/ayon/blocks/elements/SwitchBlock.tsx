import { BlockDefinition } from 'noya-state';
import { switchSymbolId } from '../../symbols/symbolIds';
import { switchSymbol } from '../../symbols/symbols';
import { getParameters } from '../../utils/getMappedParameters';
import { applyCommonProps } from '../applyCommonProps';

const globalHashtags = ['on', 'off', 'disabled'];

export const SwitchBlock: BlockDefinition = {
  symbol: switchSymbol,
  hashtags: globalHashtags,
  infer: ({ frame, blockText }) => 0.1,
  render: ({ h, Components: { [switchSymbolId]: Switch } }, props) => {
    const { on, disabled } = getParameters(props.blockParameters);

    return h(Switch, {
      ...applyCommonProps(props),
      checked: !!on,
      disabled: !!disabled,
    });
  },
};
