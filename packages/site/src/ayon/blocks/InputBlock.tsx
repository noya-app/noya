import { Input } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { inputSymbolId } from './symbols';

export const InputBlock: BlockDefinition = {
  id: inputSymbolId,
  infer: ({ frame, blockText }) => 0.1,
  render: (props) => {
    return <Input value={props.blockText} />;
  },
};
