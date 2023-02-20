import { Image } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { isApproximatelySquare, isWithinRectRange } from './score';
import { iconSymbol } from './symbols';

export const IconBlock: BlockDefinition = {
  symbol: iconSymbol,
  parser: 'regular',
  usesResolver: true,
  infer: ({ frame, blockText }) =>
    isWithinRectRange({
      rect: frame,
      minWidth: 10,
      minHeight: 10,
      maxWidth: 90,
      maxHeight: 90,
    }) && isApproximatelySquare(frame, 0.2)
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
