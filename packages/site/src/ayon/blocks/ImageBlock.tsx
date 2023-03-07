import { Flex, Image, Spinner } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import React from 'react';
import { parseBlock } from '../parse';
import { imageSymbolId } from './symbolIds';
import { imageSymbol } from './symbols';
import { getBlockClassName, tailwindBlockClasses } from './tailwind';

const placeholderText = 'landscape';

export const ImageBlock: BlockDefinition = {
  symbol: imageSymbol,
  parser: 'regular',
  infer: ({ frame, blockText }) => 0.1,
  hashtags: ['contain', 'fill', ...tailwindBlockClasses],
  usesResolver: true,
  placeholderText,
  render: ({h, Components: {
    [imageSymbolId]: Image
  }}, props) => {
    const {
      content,
      parameters: { contain, fill, ...parameters },
    } = parseBlock(props.blockText, 'regular', {
      placeholder: placeholderText,
    });
    const hashtags = Object.keys(parameters);

    const src = isExternalUrl(content)
      ? content
      : props.resolvedBlockData?.resolvedText;

    // Loading
    // if (!src && content) {
    //   const terms = content
    //     .split(' ')
    //     .map((term) => `'${term.trim()}'`)
    //     .join(', ');

    //   return (
    //     <Flex
    //       {...(props.frame
    //         ? { w: `${props.frame.width}px`, h: `${props.frame.height}px` }
    //         : { minHeight: 0 })}
    //       justifyContent="center"
    //       alignItems="center"
    //       className={getBlockClassName(hashtags)}
    //       background="rgba(0,0,0,0.05)"
    //     >
    //       <Spinner thickness="3px" color="gray" speed="1.5s" />
    //       <span style={{ marginLeft: 10 }}>Finding image of {terms}...</span>
    //     </Flex>
    //   );
    // }

    return h(
      Image,
      {
        ...(props.dataSet && {
          key: props.dataSet.id,
          'data-noya-id': props.dataSet.id,
          'data-noya-parent-id': props.dataSet.parentId,
        }),
        src,
        fit: contain ? 'contain' : fill ? 'fill' : 'cover',
        align: 'middle',
        ...(props.frame
          ? { w: `${props.frame.width}px`, h: `${props.frame.height}px` }
          : { minHeight: 0 }),
        className: getBlockClassName(hashtags),
      },
    )
  },
};
