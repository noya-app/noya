import { Avatar } from '@chakra-ui/react';
import React from 'react';
import {
  isApproximatelySquare,
  isWithinRectRange,
  scoreCommandMatch,
} from './score';
import { avatarSymbol, avatarSymbolId } from './symbols';
import { BlockDefinition } from './types';

export const AvatarBlock: BlockDefinition = {
  id: avatarSymbolId,
  infer: ({ frame, blockText }) =>
    Math.max(
      scoreCommandMatch(avatarSymbol.name, blockText),
      isWithinRectRange(frame, 30, 30, 120, 120) &&
        isApproximatelySquare(frame, 0.2)
        ? 0.8
        : 0,
    ),
  render: (props) => <Avatar size="full" />,
};
