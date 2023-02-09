import { Avatar } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import React from 'react';
import { parseBlock } from '../parse';
import { isApproximatelySquare, isWithinRectRange } from './score';
import { avatarSymbolId } from './symbols';

const AVATAR_SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];

const parser = 'regular';

export const AvatarBlock: BlockDefinition = {
  id: avatarSymbolId,
  parser,
  infer: ({ frame, blockText }) =>
    isWithinRectRange(frame, 30, 30, 120, 120) &&
    isApproximatelySquare(frame, 0.2)
      ? 0.8
      : 0,
  render: (props) => {
    const { content } = parseBlock(props.blockText, parser);
    const src = isExternalUrl(content) ? content : undefined;
    const name = !src ? content : undefined;

    // Size up in 14px increments
    const size =
      AVATAR_SIZES[
        Math.min(
          Math.floor(Math.max(props.frame.width, props.frame.height) / 14),
          AVATAR_SIZES.length - 1,
        )
      ];

    return <Avatar size={size} name={name} src={src} />;
  },
};
