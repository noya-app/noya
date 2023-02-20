import { Input } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { getBlockThemeColors } from './colors';
import { isWithinRectRange } from './score';
import { inputSymbol } from './symbols';

const globalHashtags = ['dark', 'accent', 'disabled'];

const parser = 'regular';

export const InputBlock: BlockDefinition = {
  symbol: inputSymbol,
  parser,
  hashtags: globalHashtags,
  infer: ({ frame, blockText }) =>
    isWithinRectRange({
      rect: frame,
      minWidth: 60,
      minHeight: 25,
      maxWidth: 600,
      maxHeight: 80,
    })
      ? 0.75
      : 0,
  render: (props) => {
    const {
      content,
      parameters: { dark, accent, disabled },
    } = parseBlock(props.blockText, parser);

    const height = props.frame?.height ?? 30;

    const size = height >= 45 ? 'lg' : height >= 30 ? 'md' : 'sm';

    const { backgroundColor, color, borderColor } = getBlockThemeColors({
      dark,
      accent,
    });

    return (
      <Input
        value={content}
        size={size}
        backgroundColor={backgroundColor}
        color={color}
        borderColor={borderColor}
        isDisabled={!!disabled}
      />
    );
  },
};
