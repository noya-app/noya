import { Textarea } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { getBlockThemeColors } from './colors';
import { textareaSymbol } from './symbols';

const globalHashtags = ['dark', 'accent', 'disabled'];

const parser = 'regular';

export const TextareaBlock: BlockDefinition = {
  symbol: textareaSymbol,
  parser,
  hashtags: globalHashtags,
  infer: ({ frame, blockText }) => 0.1,
  render: (props) => {
    const {
      content,
      parameters: { dark, accent, disabled },
    } = parseBlock(props.blockText, parser);

    const { backgroundColor, color, borderColor } = getBlockThemeColors({
      dark,
      accent,
    });

    return (
      <Textarea
        value={content}
        height={'100%'}
        backgroundColor={backgroundColor}
        color={color}
        borderColor={borderColor}
        isDisabled={!!disabled}
      />
    );
  },
};
