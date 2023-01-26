import { SystemProps, Text } from '@chakra-ui/react';
import React from 'react';
import { filterTextPropertyHashTags } from '../parse';
import { scoreCommandMatch } from './score';
import { textSymbol, textSymbolId } from './symbols';
import { BlockDefinition } from './types';

export const TextBlock: BlockDefinition = {
  id: textSymbolId,
  infer: ({ frame, blockText }) =>
    Math.max(
      scoreCommandMatch(textSymbol.name, blockText),
      blockText &&
        blockText.split(' ').filter((word) => word[0] !== '#').length > 0
        ? 0.7
        : 0,
      0.1,
    ),
  render: (props) => {
    const { content, color, fontWeight, fontSize, align } =
      filterTextPropertyHashTags(props.blockText);
    return (
      <Text
        color={color}
        fontWeight={fontWeight}
        fontSize={fontSize}
        align={align as SystemProps['textAlign']}
      >
        {content}
      </Text>
    );
  },
};
