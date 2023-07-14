import { InputProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import { getBlockThemeColors } from '../../blocks/blockTheme';
import { isWithinRectRange } from '../../infer/score';
import {
  getTailwindClassesByGroup,
  parametersToTailwindStyle,
} from '../../tailwind/tailwind';
import { getParameters } from '../../utils/getMappedParameters';
import { inputSymbolId } from '../symbolIds';
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
    render: ({ Components, instance }: RenderProps) => {
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
