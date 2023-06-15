import { component } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { isWithinRectRange } from './score';
import { radioSymbolId } from './symbolIds';
import { radioSymbol } from './symbols';

const placeholderText = '#off Daily';

const globalHashtags = ['on', 'off', 'disabled', 'no-label'];

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
  render: (
    { h, Components: { [radioSymbolId]: Radio, [component.id.Box]: Box } },
    props,
  ) => {
    const {
      content,
      parameters: { on, disabled, 'no-label': noLabel },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const inner = h(Radio, {
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
