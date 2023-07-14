import { TextProps, TextVariant } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import {
  parametersToTailwindStyle,
  tailwindTextClasses,
} from '../../tailwind/tailwind';
import { getMappedParameters } from '../../utils/getMappedParameters';
import { textSymbolId } from '../symbolIds';
import { RenderProps } from '../types';

const variantKeys: TextVariant[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const positionKeys = ['left', 'center', 'right'];
const schema = {
  variant: variantKeys,
  position: positionKeys,
};

export const textSymbol = SketchModel.symbolMaster({
  symbolID: textSymbolId,
  name: 'Text',
  blockDefinition: {
    hashtags: [
      ...variantKeys,
      ...positionKeys,
      ...tailwindTextClasses,
      'flex-1',
    ],
    infer: ({ frame }) => 0.1,
    render: ({ Components, instance, passthrough }: RenderProps) => {
      const Text: React.FC<TextProps> = Components[textSymbolId];

      const content = instance.blockText;

      const { variant, position } = getMappedParameters(
        instance.blockParameters,
        schema,
      );

      const style = parametersToTailwindStyle(instance.blockParameters);

      return (
        <Text
          {...passthrough}
          // We should allow undefined here for default
          variant={variant as TextVariant}
          style={{
            ...style,
            ...(position &&
              position !== 'center' && {
                textAlign: position as 'left' | 'center' | 'right',
              }),
          }}
        >
          {content}
        </Text>
      );
    },
  },
});
