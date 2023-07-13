import { TextProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import {
  parametersToTailwindStyle,
  simpleAlignmentResolver,
  tailwindTextClasses,
} from '../tailwind/tailwind';
import { getParameters } from '../utils/getMappedParameters';
import { textSymbolId } from './symbolIds';
import { RenderProps } from './types';

export const textSymbol = SketchModel.symbolMaster({
  symbolID: textSymbolId,
  name: 'Text',
  blockDefinition: {
    hashtags: ['left', 'center', 'right', ...tailwindTextClasses, 'flex-1'],
    infer: ({ frame }) => 0.1,
    render: ({ Components, instance }: RenderProps) => {
      const Text: React.FC<TextProps> = Components[textSymbolId];

      const content = instance.blockText;
      const parameters = getParameters(instance.blockParameters);
      const style = parametersToTailwindStyle(
        parameters,
        simpleAlignmentResolver,
      );

      return (
        <Text variant={undefined as any} style={style}>
          {content}
        </Text>
      );
    },
  },
});
