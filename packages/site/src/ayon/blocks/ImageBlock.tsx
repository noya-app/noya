import { Image } from '@chakra-ui/react';
import { isExternalUrl } from 'noya-utils';
import React from 'react';
import { scoreCommandMatch } from './score';
import { imageSymbol, imageSymbolId } from './symbols';
import { BlockDefinition } from './types';

export const ImageBlock: BlockDefinition = {
  id: imageSymbolId,
  infer: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(imageSymbol.name, blockText), 0.1),
  render: (props) => (
    <Image
      src={
        props.blockText && isExternalUrl(props.blockText)
          ? props.blockText
          : props.resolvedBlockData?.resolvedText
      }
      fit="cover"
      align="middle"
      w="100%"
      h="100%"
    />
  ),
};
