import { component } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { isWithinRectRange } from '../infer/score';
import { getParameters } from '../utils/getMappedParameters';
import { applyCommonProps } from './applyCommonProps';
import { checkboxSymbolId } from './symbolIds';
import { checkboxSymbol } from './symbols';

const placeholderText = '#off Remember me';

const globalHashtags = ['on', 'off', 'disabled', 'no-label'];

export const CheckboxBlock: BlockDefinition = {
  symbol: checkboxSymbol,
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
  render: (
    {
      h,
      Components: { [checkboxSymbolId]: Checkbox, [component.id.Box]: Box },
    },
    props,
  ) => {
    const {
      on,
      disabled,
      'no-label': noLabel,
    } = getParameters(props.blockParameters);
    const content = props.blockText ?? placeholderText;

    const inner = h(Checkbox, {
      ...applyCommonProps(props),
      checked: !!on,
      disabled: !!disabled,
      ...(!noLabel && { label: content }),
    });

    // Center within frame
    return props.frame
      ? h(
          Box,
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              width: props.frame.width,
              height: props.frame.height,
            },
          },
          inner,
        )
      : inner;
  },
};
