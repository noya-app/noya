import { Switch } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { switchSymbolId } from './symbols';

export const SwitchBlock: BlockDefinition = {
  id: switchSymbolId,
  infer: ({ frame, blockText }) => 0.1,
  render: (props) => <Switch />,
};
