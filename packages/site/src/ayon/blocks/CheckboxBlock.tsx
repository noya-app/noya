import { Checkbox } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import {
  isApproximatelySquare,
  isWithinRectRange,
  scoreCommandMatch,
} from './score';
import { checkboxSymbol, checkboxSymbolId } from './symbols';

export const CheckboxBlock: BlockDefinition = {
  id: checkboxSymbolId,
  infer: ({ frame, blockText }) =>
    Math.max(
      scoreCommandMatch(checkboxSymbol.name, blockText),
      isWithinRectRange(frame, 10, 10, 20, 20) &&
        isApproximatelySquare(frame, 0.1)
        ? 0.8
        : 0,
    ),
  render: (props) => <Checkbox />,
};
