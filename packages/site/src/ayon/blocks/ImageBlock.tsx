import { Image } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import React from 'react';
import { parseBlock } from '../parse';
import { imageSymbol } from './symbols';
import { getBlockClassName, tailwindBlockClasses } from './tailwind';

export const ImageBlock: BlockDefinition = {
  symbol: imageSymbol,
  parser: 'regular',
  infer: ({ frame, blockText }) => 0.1,
  hashtags: ['contain', 'fill', ...tailwindBlockClasses],
  usesResolver: true,
  render: (props) => {
    const {
      content,
      parameters: { contain, fill, ...parameters },
    } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);

    const src = isExternalUrl(content)
      ? content
      : props.resolvedBlockData?.resolvedText;

    return (
      <Image
        src={src}
        fit={contain ? 'contain' : fill ? 'fill' : 'cover'}
        align="middle"
        {...(props.frame && {
          w: `${props.frame.width}px`,
          h: `${props.frame.height}px`,
        })}
        className={getBlockClassName(hashtags)}
      />
    );
  },
};
