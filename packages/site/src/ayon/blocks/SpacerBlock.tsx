import { Spacer } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { spacerSymbolId } from './symbols';
import { getBlockClassName } from './tailwind';

export const SpacerBlock: BlockDefinition = {
  id: spacerSymbolId,
  parser: 'regular',
  infer: ({ frame, blockText }) => 0,
  render: (props) => {
    const { parameters } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);

    return <Spacer flex="0" className={getBlockClassName(hashtags)} />;
  },
};
