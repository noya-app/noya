import { SystemProps, Text } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { filterTextPropertyHashTags } from '../parse';
import { scoreCommandMatch } from './score';
import { textSymbol, textSymbolId } from './symbols';
import { getBlockClassName } from './tailwind';

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
    const { content, color, fontWeight, fontSize, align, hashTags } =
      filterTextPropertyHashTags(props.blockText);

    const hasTailwindColor = hashTags.some((value) =>
      value.startsWith('text-'),
    );

    return (
      <Text
        color={hasTailwindColor ? undefined : color}
        fontWeight={fontWeight}
        fontSize={fontSize}
        align={align as SystemProps['textAlign']}
        className={getBlockClassName(hashTags)}
      >
        {content}
      </Text>
    );
  },
};
