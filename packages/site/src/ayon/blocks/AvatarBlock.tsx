import { BlockDefinition } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import { parseBlock } from '../parse';
import { isApproximatelySquare, isWithinRectRange } from './score';
import { avatarSymbolId } from './symbolIds';
import { avatarSymbol } from './symbols';

const AVATAR_SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];

const parser = 'regular';

export const AvatarBlock: BlockDefinition = {
  symbol: avatarSymbol,
  parser,
  infer: ({ frame, blockText }) =>
    isWithinRectRange({
      rect: frame,
      minWidth: 30,
      minHeight: 30,
      maxWidth: 120,
      maxHeight: 120,
    }) && isApproximatelySquare(frame, 0.2)
      ? 0.8
      : 0,
  render: ({ h, Components: { [avatarSymbolId]: Avatar } }, props) => {
    const { content } = parseBlock(props.blockText, parser);
    const src = isExternalUrl(content) ? content : undefined;
    const name = !src ? content : undefined;

    // Size up in 14px increments
    const size = props.frame
      ? AVATAR_SIZES[
          Math.min(
            Math.floor(Math.max(props.frame.width, props.frame.height) / 14),
            AVATAR_SIZES.length - 1,
          )
        ]
      : 'md';

    const sizePx = props.frame
      ? Math.min(props.frame.width, props.frame.height)
      : undefined;

    return h(Avatar, {
      size,
      name,
      src,
      style: {
        aspectRatio: '1',
        ...(sizePx && {
          width: `${sizePx}px`,
          height: `${sizePx}px`,
        }),
      },
    });
  },
};
