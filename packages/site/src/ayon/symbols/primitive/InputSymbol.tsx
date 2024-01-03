import { SketchModel } from '@noya-app/noya-sketch-model';
import { InputProps } from '@noya-design-system/protocol';
import {
  getTailwindClassesByGroup,
  parametersToTailwindStyle,
} from 'noya-tailwind';
import React from 'react';
import { isWithinRectRange } from '../../infer/score';
import { getParameters } from '../../utils/getMappedParameters';
import { inputSymbolId } from '../symbolIds';
import { getBlockThemeColors } from '../symbolTheme';
import { RenderProps } from '../types';

const globalHashtags = [
  'dark',
  'accent',
  'disabled',
  ...getTailwindClassesByGroup('flexBasis'),
];

export const inputSymbol = SketchModel.symbolMaster({
  symbolID: inputSymbolId,
  name: 'Input',
  blockDefinition: {
    supportsBlockText: true,
    hashtags: globalHashtags,
    infer: ({ frame }) =>
      isWithinRectRange({
        rect: frame,
        minWidth: 60,
        minHeight: 25,
        maxWidth: 600,
        maxHeight: 80,
      })
        ? 0.75
        : 0,
    render: ({ Components, instance, passthrough }: RenderProps) => {
      const Input: React.FC<InputProps> = Components[inputSymbolId];

      const content = instance.blockText;
      const { dark, accent, disabled, ...parameters } = getParameters(
        instance.blockParameters,
      );

      const { backgroundColor, color, borderColor } = getBlockThemeColors({
        dark,
        accent,
      });

      const style = parametersToTailwindStyle(parameters);

      return (
        <Input
          {...passthrough}
          placeholder={content}
          disabled={!!disabled}
          style={{
            backgroundColor,
            color,
            borderColor,
            ...style,
          }}
        />
      );
    },
  },
});
