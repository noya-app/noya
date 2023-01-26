import { Input } from '@chakra-ui/react';
import React from 'react';
import { scoreCommandMatch } from './score';
import { inputSymbol, inputSymbolId } from './symbols';
import { BlockDefinition } from './types';

export const InputBlock: BlockDefinition = {
  id: inputSymbolId,
  infer: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(inputSymbol.name, blockText), 0.1),
  render: (props) => {
    return <Input value={props.blockText} />;
  },
};
