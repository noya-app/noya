import { Spacer } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { spacerSymbol } from './symbols';
import { getBlockClassName, tailwindBlockClasses } from './tailwind';

export const SpacerBlock: BlockDefinition = {
  symbol: spacerSymbol,
  parser: 'regular',
  hashtags: tailwindBlockClasses,
  infer: ({ frame, blockText }) => 0,
  render: (props) => {
    const { parameters } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);

    return (
      <Spacer
        {...(props.dataSet && {
          key: props.dataSet.id,
        })}
        className={getBlockClassName(hashtags)}
      />
    );
  },
};
