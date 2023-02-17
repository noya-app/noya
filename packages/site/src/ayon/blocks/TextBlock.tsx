import { Text } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { getTextAlign, parseBlock } from '../parse';
import { textSymbol } from './symbols';
import { getBlockClassName, tailwindTextClasses } from './tailwind';

export const TextBlock: BlockDefinition = {
  symbol: textSymbol,
  parser: 'regular',
  hashtags: ['left', 'center', 'right', ...tailwindTextClasses, 'flex-1'],
  infer: ({ frame, blockText }) =>
    Math.max(
      blockText &&
        blockText.split(' ').filter((word) => word[0] !== '#').length > 0
        ? 0.7
        : 0,
      0.1,
    ),
  render: (props) => {
    const { content, parameters } = parseBlock(props.blockText, 'regular');

    const hashtags = Object.keys(parameters);

    return (
      <Text
        {...(props.dataSet && {
          key: props.dataSet.id,
          'data-noya-id': props.dataSet.id,
          'data-noya-parent-id': props.dataSet.parentId,
        })}
        textAlign={getTextAlign(parameters)}
        className={getBlockClassName(hashtags)}
      >
        {content}
      </Text>
    );
  },
};
