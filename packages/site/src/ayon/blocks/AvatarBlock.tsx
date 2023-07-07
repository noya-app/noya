import { applyCommonProps } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import { getBlockClassName } from '../tailwind/tailwind';
import { getParameters } from '../utils/getMappedParameters';
import { isApproximatelySquare, isWithinRectRange } from './score';
import { avatarSymbolId } from './symbolIds';
import { avatarSymbol } from './symbols';

const AVATAR_SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export const AvatarBlock: BlockDefinition = {
  symbol: avatarSymbol,
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
    const parameters = getParameters(props.blockParameters);
    const content = props.blockText ?? '';
    const src = isExternalUrl(content) ? content : undefined;
    const name = !src ? content : undefined;
    const hashtags = Object.keys(parameters);

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

    const widthHashtag = hashtags.find((hashtag) => hashtag.startsWith('w-'));
    const widthMatch = widthHashtag ? widthHashtag.match(/w-(\d+)/) : undefined;
    const width = widthMatch ? Number(widthMatch[1]) : undefined;
    const tailwindSize = width ? `${width * 0.25}rem` : undefined;

    return h(Avatar, {
      ...applyCommonProps(props),
      size,
      name,
      src,
      style: {
        aspectRatio: '1',
        ...(sizePx && {
          width: `${sizePx}px`,
          height: `${sizePx}px`,
        }),
        ...(tailwindSize && {
          width: tailwindSize,
          height: tailwindSize,
        }),
      },
      className: getBlockClassName(hashtags),
    });
  },
};
