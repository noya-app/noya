import { Select } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { getBlockThemeColors } from './colors';
import { isWithinRectRange } from './score';
import { selectSymbol } from './symbols';

const placeholderText = `
Role
Guest
Member
Admin`.trim();

const globalHashtags = ['dark', 'accent', 'disabled'];

const parser = 'newlineSeparated';

export const SelectBlock: BlockDefinition = {
  symbol: selectSymbol,
  parser,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText }) =>
    isWithinRectRange(frame, 60, 25, 400, 80) ? 0.7 : 0,
  render: (props) => {
    const {
      items,
      parameters: { dark, accent, disabled },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const height = props.frame?.height ?? 30;

    const size = height >= 45 ? 'lg' : height >= 30 ? 'md' : 'sm';

    const { backgroundColor, color, borderColor } = getBlockThemeColors({
      dark,
      accent,
    });

    return (
      <Select
        size={size}
        backgroundColor={backgroundColor}
        color={color}
        borderColor={borderColor}
        isDisabled={!!disabled}
        placeholder={items[0].content}
      >
        {items.slice(1).map((item, index) => (
          <option key={item.content}>{item.content}</option>
        ))}
      </Select>
    );
  },
};
