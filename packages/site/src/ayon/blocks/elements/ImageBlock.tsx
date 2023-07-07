import { ImageProps } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import {
  getBlockClassName,
  parametersToTailwindStyle,
  tailwindBlockClasses,
} from '../../tailwind/tailwind';
import { getParameters } from '../../utils/getMappedParameters';
import { applyCommonProps } from '../applyCommonProps';
import { boxSymbolId, imageSymbolId } from '../symbolIds';
import { imageSymbol } from '../symbols';

const placeholderText = 'landscape';

export const ImageBlock: BlockDefinition = {
  symbol: imageSymbol,
  infer: ({ frame, blockText }) => 0.1,
  hashtags: ['contain', 'fill', ...tailwindBlockClasses],
  usesResolver: true,
  placeholderText,
  render: (
    { h, Components: { [imageSymbolId]: Image, [boxSymbolId]: Box } },
    props,
  ) => {
    const content = props.blockText ?? placeholderText;
    const { contain, fill, ...parameters } = getParameters(
      props.blockParameters,
    );
    const hashtags = Object.keys(parameters);

    const src = isExternalUrl(content)
      ? content
      : props.resolvedBlockData?.resolvedText;

    const style = parametersToTailwindStyle(parameters);

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
            ...style,
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

    return h<ImageProps>(Image, {
      ...applyCommonProps(props),
      src,
      style: {
        ...(props.frame
          ? {
              width: `${props.frame.width}px`,
              height: `${props.frame.height}px`,
            }
          : { minHeight: 0, minWidth: 0 }),
        objectFit: contain ? 'contain' : fill ? 'fill' : 'cover',
        ...style,
      },
    });
  },
};
