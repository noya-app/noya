import { BlockDefinition } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import { parseBlock } from '../parse';
import { boxSymbolId, imageSymbolId } from './symbolIds';
import { imageSymbol } from './symbols';
import { getBlockClassName, tailwindBlockClasses } from './tailwind';

const placeholderText = 'landscape';

export const ImageBlock: BlockDefinition = {
  symbol: imageSymbol,
  parser: 'regular',
  infer: ({ frame, blockText }) => 0.1,
  hashtags: ['contain', 'fill', ...tailwindBlockClasses],
  usesResolver: true,
  placeholderText,
  render: (
    { h, Components: { [imageSymbolId]: Image, [boxSymbolId]: Box } },
    props,
  ) => {
    const {
      content,
      parameters: { contain, fill, ...parameters },
    } = parseBlock(props.blockText, 'regular', {
      placeholder: placeholderText,
    });
    const hashtags = Object.keys(parameters);

    const src = isExternalUrl(content)
      ? content
      : props.resolvedBlockData?.resolvedText;

    // Loading
    if (!src && content) {
      const terms = content
        .split(' ')
        .map((term) => `'${term.trim()}'`)
        .join(', ');

      return h(
        Box,
        {
          className: getBlockClassName(hashtags),
          style: {
            display: 'flex',
            ...(props.frame
              ? {
                  width: `${props.frame.width}px`,
                  height: `${props.frame.height}px`,
                }
              : { minHeight: 0 }),
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.05)',
          },
        },
        [h('span', {}, [`Finding image of ${terms}...`])],
      );
    }

    return h(Image, {
      ...(props.dataSet && {
        key: props.dataSet.id,
        'data-noya-id': props.dataSet.id,
        'data-noya-parent-id': props.dataSet.parentId,
      }),
      src,
      style: {
        ...(props.frame
          ? {
              width: `${props.frame.width}px`,
              height: `${props.frame.height}px`,
            }
          : { minHeight: 0 }),
        objectFit: contain ? 'contain' : fill ? 'fill' : 'cover',
      },
      className: getBlockClassName(hashtags),
    });
  },
};
