import { Image } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { isApproximatelySquare, isWithinRectRange } from './score';
import { iconSymbolId } from './symbols';

export const IconBlock: BlockDefinition = {
  id: iconSymbolId,
  parser: 'regular',
  infer: ({ frame, blockText }) =>
    isWithinRectRange(frame, 10, 10, 90, 90) &&
    isApproximatelySquare(frame, 0.2)
      ? 0.85
      : 0,
  render: (props) => (
    <Image
      src={
        props.resolvedBlockData?.resolvedText ??
        'https://api.iconify.design/material-symbols/menu.svg'
      }
      fit="contain"
      align="middle"
      w="100%"
      h="100%"
    />
  ),
};
