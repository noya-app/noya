import { Flex } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { accentColor } from './blockTheme';
import { boxSymbol } from './symbols';
import {
  getBlockClassName,
  hasClassGroup,
  tailwindBlockClasses,
} from './tailwind';

export const BoxBlock: BlockDefinition = {
  symbol: boxSymbol,
  parser: 'regular',
  infer: ({ frame, blockText }) => 0.1,
  hashtags: ['left', 'center', 'right', ...tailwindBlockClasses],
  render: (props) => {
    const { content, parameters } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);

    const backgroundColor = hasClassGroup('background', hashtags)
      ? undefined
      : [content]
          .concat(hashtags)
          .find((value) => CSS.supports('color', `${value}`)) ??
        accentColor[50];

    const justify = parameters['flex-row']
      ? parameters.left
        ? ['justify-start']
        : parameters.center
        ? ['justify-center']
        : parameters.right
        ? ['justify-end']
        : []
      : parameters.center
      ? ['justify-center']
      : [];
    const items = parameters['flex-col']
      ? parameters.left
        ? ['items-start']
        : parameters.center
        ? ['items-center']
        : parameters.right
        ? ['items-end']
        : []
      : parameters.center
      ? ['items-center']
      : [];

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
        bg={backgroundColor}
        className={getBlockClassName([...hashtags, ...justify, ...items])}
      >
        {props.children}
      </Flex>
    );
  },
};
