import { Flex } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { accentColor } from './blockTheme';
import { boxSymbol } from './symbols';
import { getBlockClassName, tailwindBlockClasses } from './tailwind';

export const BoxBlock: BlockDefinition = {
  symbol: boxSymbol,
  parser: 'regular',
  infer: ({ frame, blockText }) => 0.1,
  hashtags: tailwindBlockClasses,
  render: (props) => {
    const { content, parameters } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);

    const color =
      [content]
        .concat(hashtags)
        .find((value) => CSS.supports('color', `${value}`)) ?? accentColor[50];

    return (
      <Flex
        {...(props.dataSet && {
          key: props.dataSet.id,
          'data-noya-id': props.dataSet.id,
          'data-noya-parent-id': props.dataSet.parentId,
        })}
        {...(props.frame && {
          width: `${props.frame.width}px`,
          height: `${props.frame.height}px`,
        })}
        bg={color}
        className={getBlockClassName(hashtags)}
      >
        {props.children}
      </Flex>
    );
  },
};
