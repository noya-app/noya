import { Box } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { filterHashTagsAndSlashCommands } from '../parse';
import { scoreCommandMatch } from './score';
import { boxSymbol, boxSymbolId } from './symbols';

export const BoxBlock: BlockDefinition = {
  id: boxSymbolId,
  infer: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(boxSymbol.name, blockText), 0.1),
  render: (props) => {
    const { content, hashTags } = filterHashTagsAndSlashCommands(
      props.blockText,
    );
    const color =
      [content]
        .concat(hashTags)
        .find((value) => CSS.supports('color', `${value}`)) ?? '#ebfdff';
    return <Box bg={color} w="100%" h="100%" />;
  },
};
