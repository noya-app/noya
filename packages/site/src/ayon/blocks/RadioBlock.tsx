import { Radio } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { isApproximatelySquare, isWithinRectRange } from './score';
import { radioSymbolId } from './symbols';

const placeholderText = '#off';

const globalHashtags = ['on', 'off', 'disabled'];

const parser = 'regular';

export const RadioBlock: BlockDefinition = {
  id: radioSymbolId,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText }) =>
    isWithinRectRange(frame, 10, 10, 30, 30) &&
    isApproximatelySquare(frame, 0.1)
      ? 0.8
      : 0,
  render: (props) => {
    const {
      parameters: { on, disabled },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });
    const size =
      props.frame.height >= 20 ? 'lg' : props.frame.height >= 15 ? 'md' : 'sm';
    return <Radio size={size} isChecked={!!on} isDisabled={!!disabled} />;
  },
};
