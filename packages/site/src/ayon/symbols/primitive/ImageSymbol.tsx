import { ImageProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import { isExternalUrl } from 'noya-utils';
import React from 'react';
import {
  parametersToTailwindStyle,
  tailwindBlockClasses,
} from '../../tailwind/tailwind';
import { getParameters } from '../../utils/getMappedParameters';
import { boxSymbolId, imageSymbolId } from '../symbolIds';
import { RenderProps } from '../types';

const placeholderText = 'landscape';

export const imageSymbol = SketchModel.symbolMaster({
  symbolID: imageSymbolId,
  name: 'Image',
  blockDefinition: {
    infer: ({ frame }) => 0.1,
    hashtags: ['contain', 'fill', ...tailwindBlockClasses],
    usesResolver: true,
    placeholderText,
    render: ({ Components, instance }: RenderProps) => {
      const Image: React.FC<ImageProps> = Components[imageSymbolId];
      const Box: React.FC<ImageProps> = Components[boxSymbolId];

      const content = instance.blockText ?? placeholderText;
      const { contain, fill, ...parameters } = getParameters(
        instance.blockParameters,
      );

      const src = isExternalUrl(content) ? content : '';
      // : props.resolvedBlockData?.resolvedText;

      const style = parametersToTailwindStyle(parameters);

      // Loading
      if (!src && content) {
        const terms = content
          .split(' ')
          .map((term) => `'${term.trim()}'`)
          .join(', ');

        return (
          <Box
            style={{
              ...style,
              display: 'flex',
              minHeight: 0,
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.05)',
            }}
          >
            <span>Finding image of {terms}...</span>
          </Box>
        );
      }

      return (
        <Image
          key={instance.do_objectID}
          src={src}
          style={{
            minHeight: 0,
            minWidth: 0,
            objectFit: contain ? 'contain' : fill ? 'fill' : 'cover',
            ...style,
          }}
        />
      );
    },
  },
});
