import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { isApproximatelySquare, isWithinRectRange } from './score';
import { boxSymbolId, imageSymbolId } from './symbolIds';
import { iconSymbol } from './symbols';
import {
  getTailwindClassesByGroup,
  parametersToTailwindStyle,
} from './tailwind';

export const IconBlock: BlockDefinition = {
  symbol: iconSymbol,
  usesResolver: true,
  hashtags: [
    ...getTailwindClassesByGroup('borderRadius'),
    ...getTailwindClassesByGroup('fill'),
    ...getTailwindClassesByGroup('background'),
  ],
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
    const style = parametersToTailwindStyle(parameters);

    const { fill, ...remainingStyles } = style;

    const inner = fill
      ? h(Box, {
          style: {
            width: '100%',
            height: '100%',
            backgroundColor: fill,
            maskImage: `url(${src}) center / contain no-repeat`,
            WebkitMask: `url(${src}) center / contain no-repeat`,
          },
        })
      : h(Image, {
          src: src,
          style: {
            objectFit: 'contain',
            width: '100%',
            height: '100%',
          },
        });

    if (Object.keys(remainingStyles).length === 0) {
      return inner;
    }

    return h(
      Box,
      {
        ...(props.dataSet && {
          key: props.dataSet.id,
        }),
        style: {
          ...style,
          ...(props.frame
            ? {
                width: `${props.frame.width}px`,
                height: `${props.frame.height}px`,
              }
            : {}),
        },
      },
      inner,
    );
  },
};
