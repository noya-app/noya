import { Switch } from '@chakra-ui/react';
import React from 'react';
import { scoreCommandMatch } from './score';
import { switchSymbol, switchSymbolId } from './symbols';
import { BlockDefinition } from './types';

export const SwitchBlock: BlockDefinition = {
  id: switchSymbolId,
  infer: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(switchSymbol.name, blockText), 0.1),
  render: (props) => <Switch />,
};
