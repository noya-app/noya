import { Avatar } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { isApproximatelySquare, isWithinRectRange } from './score';
import { avatarSymbolId } from './symbols';

export const AvatarBlock: BlockDefinition = {
  id: avatarSymbolId,
  parser: 'regular',
  infer: ({ frame, blockText }) =>
    isWithinRectRange(frame, 30, 30, 120, 120) &&
    isApproximatelySquare(frame, 0.2)
      ? 0.8
      : 0,
  render: (props) => <Avatar size="full" />,
};
