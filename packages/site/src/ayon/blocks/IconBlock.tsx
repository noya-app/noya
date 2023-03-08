import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { isApproximatelySquare, isWithinRectRange } from './score';
import { boxSymbolId, imageSymbolId } from './symbolIds';
import { iconSymbol } from './symbols';
import { getTailwindClassesByGroup, isTailwindClassGroup } from './tailwind';
import { resolveColor } from './tailwindColors';

export const IconBlock: BlockDefinition = {
  symbol: iconSymbol,
  parser: 'regular',
  usesResolver: true,
  hashtags: getTailwindClassesByGroup('fill'),
  isComposedBlock: true,
  infer: ({ frame, blockText }) =>
    isWithinRectRange({
      rect: frame,
      minWidth: 10,
      minHeight: 10,
      maxWidth: 90,
      maxHeight: 90,
    }) && isApproximatelySquare(frame, 0.2)
      ? 0.85
      : 0,
  render: (
    { h, Components: { [boxSymbolId]: Box, [imageSymbolId]: Image } },
    props,
  ) => {
    const src =
      props.resolvedBlockData?.resolvedText ??
      'https://api.iconify.design/material-symbols/menu.svg';
    const { parameters } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);
    const fillClassName = hashtags
      .slice()
      .reverse()
      .find((hashtag) => isTailwindClassGroup(hashtag, 'fill'));
    const fill = fillClassName ? resolveColor(fillClassName) : undefined;

    if (fill) {
      return h(Box, {
        style: {
          width: '100%',
          height: '100%',
          backgroundColor: fill,
          maskImage: `url(${src}) center / contain no-repeat`,
          WebkitMask: `url(${src}) center / contain no-repeat`,
        },
      });
    } else {
      return h(Image, {
        src: src,
        style: {
          objectFit: 'contain',
          width: '100%',
          height: '100%',
        },
      });
    }
  },
};
