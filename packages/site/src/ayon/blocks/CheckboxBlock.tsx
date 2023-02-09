import { Checkbox } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { isWithinRectRange } from './score';
import { checkboxSymbolId } from './symbols';

const placeholderText = '#off Remember me';

const globalHashtags = ['on', 'off', 'disabled'];

const parser = 'regular';

export const CheckboxBlock: BlockDefinition = {
  id: checkboxSymbolId,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText }) =>
    isWithinRectRange(frame, 10, 10, 300, 60) ? 0.8 : 0,
  render: (props) => {
    const {
      content,
      parameters: { on, disabled },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });
    const size =
      props.frame.height >= 30 ? 'lg' : props.frame.height >= 20 ? 'md' : 'sm';
    return (
      <Checkbox size={size} isChecked={!!on} isDisabled={!!disabled}>
        {props.frame.width > 40 && content}
      </Checkbox>
    );
  },
};
