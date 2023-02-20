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
        {...(props.dataSet && {
          key: props.dataSet.id,
          'data-noya-id': props.dataSet.id,
          'data-noya-parent-id': props.dataSet.parentId,
        })}
        src={src}
        fit={contain ? 'contain' : fill ? 'fill' : 'cover'}
        align="middle"
        {...(props.frame
          ? { w: `${props.frame.width}px`, h: `${props.frame.height}px` }
          : { minHeight: 0 })}
        className={getBlockClassName(hashtags)}
      />
    );
  },
};
