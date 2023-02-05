import { Box } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { accentColor } from './blockTheme';
import { boxSymbolId } from './symbols';
import { getBlockClassName, getTailwindClasses } from './tailwind';

export const BoxBlock: BlockDefinition = {
  id: boxSymbolId,
  infer: ({ frame, blockText }) => 0.1,
  globalHashtags: getTailwindClasses([
    { pattern: /^(shadow|border|rounded|opacity|bg|blur).*/ },
  ]),
  render: (props) => {
    const { content, parameters } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);

    const color =
      [content]
        .concat(hashtags)
        .find((value) => CSS.supports('color', `${value}`)) ?? accentColor[50];

    return (
      <Box
        bg={color}
        w="100%"
        h="100%"
        className={getBlockClassName(hashtags)}
      />
    );
  },
};
