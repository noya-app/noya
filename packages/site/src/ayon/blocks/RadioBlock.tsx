import { Radio } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { isWithinRectRange } from './score';
import { radioSymbol } from './symbols';

const placeholderText = '#on Daily';

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
  render: (props) => {
    const {
      content,
      parameters: { on, disabled },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const height = props.frame ? props.frame.height : 20;
    const width = props.frame ? props.frame.width : 40;

    const size = height >= 30 ? 'lg' : height >= 20 ? 'md' : 'sm';

    return (
      <Radio size={size} isChecked={!!on} isDisabled={!!disabled}>
        {width >= 40 && content}
      </Radio>
    );
  },
};
