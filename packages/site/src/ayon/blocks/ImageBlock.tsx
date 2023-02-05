import { Image } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import React from 'react';
import { parseBlock } from '../parse';
import { imageSymbolId } from './symbols';
import { getBlockClassName, tailwindBlockClasses } from './tailwind';

export const ImageBlock: BlockDefinition = {
  id: imageSymbolId,
  parser: 'regular',
  infer: ({ frame, blockText }) => 0.1,
  hashtags: ['contain', 'fill', ...tailwindBlockClasses],
  render: (props) => {
    const {
      content,
      parameters: { contain, fill, ...parameters },
    } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);

    return (
      <Image
        src={
          isExternalUrl(content)
            ? content
            : props.resolvedBlockData?.resolvedText
        }
        fit={contain ? 'contain' : fill ? 'fill' : 'cover'}
        align="middle"
        w="100%"
        h="100%"
        className={getBlockClassName(hashtags)}
      />
    );
  },
};
