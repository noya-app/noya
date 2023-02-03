import { SystemProps, Text } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { filterTextPropertyHashTags } from '../parse';
import { textSymbolId } from './symbols';
import { getBlockClassName, getTailwindClasses } from './tailwind';

export const TextBlock: BlockDefinition = {
  id: textSymbolId,
  globalHashtags: getTailwindClasses(),
  infer: ({ frame, blockText }) =>
    Math.max(
      blockText &&
        blockText.split(' ').filter((word) => word[0] !== '#').length > 0
        ? 0.7
        : 0,
      0.1,
    ),
  render: (props) => {
    const { content, color, fontWeight, fontSize, align, hashTags } =
      filterTextPropertyHashTags(props.blockText);

    return (
      <Text
        color={color}
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
