import { Image } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import React from 'react';
import { filterHashTagsAndSlashCommands } from '../parse';
import { imageSymbolId } from './symbols';
import { getBlockClassName, getTailwindClasses } from './tailwind';

export const ImageBlock: BlockDefinition = {
  id: imageSymbolId,
  infer: ({ frame, blockText }) => 0.1,
  globalHashtags: getTailwindClasses([
    { pattern: /^(shadow|border|rounded|opacity|bg|blur).*/ },
  ]),
  render: (props) => {
    const { content, hashTags } = filterHashTagsAndSlashCommands(
      props.blockText,
    );

    return (
      <Image
        src={
          isExternalUrl(content)
            ? content
            : props.resolvedBlockData?.resolvedText
        }
        fit="cover"
        align="middle"
        w="100%"
        h="100%"
        className={getBlockClassName(hashTags)}
      />
    );
  },
};
